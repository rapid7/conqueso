/**
* COPYRIGHT (C) 2014, Rapid7 LLC, Boston, MA, USA.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

/* jshint maxstatements:false */
module.exports = function(express, app, persist) {
    var trycatch = require("trycatch"),
        bodyParser = require("body-parser"),
        utils = require("../utils"),
        logger = require("../logger");

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    function defaultContentTypeMiddleware(req, res, next) {
        req.headers["content-type"] = req.headers["content-type"] || "application/json";
        next();
    }

    app.use(defaultContentTypeMiddleware);

    function getRemoteIp(req) {
        return req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    }

    // Get info about conqueso
    app.get("/api/info", function(req, res) {
        res.json(require("../../package.json"));
    });

    // Get roles
    app.get("/api/roles", function(req, res) {
        persist.getRoles(function(roles) {
            res.json(roles);
        });
    });

    function updatePropertyHelper(req, res) {
        var propertyObject = req.body;

        if (req.params.property) {
            propertyObject.name = req.params.property;
        }

        trycatch(function() {
            persist.updateProperty(req.params.role, propertyObject, function(err, property) {
                if (err) {
                    res.json(err);
                    return;
                }
                res.json(property);
            });
        }, function() {
            res.status(500).send("Failed to update property");
        });
    }

    // Update a specific property
    app.put("/api/roles/:role/properties", updatePropertyHelper);
    app.put("/api/roles/:role/properties/:property", updatePropertyHelper);

    // Makes a property global
    app.post("/api/roles/:role/properties/:property/globalize", function(req, res) {
        trycatch(function() {
            persist.globalizeProperty(req.params.role, req.params.property, function(result) {
                res.json(result);
            });
        }, function(err) {
            res.status(500).send("Failed to make property global");
            logger.error(err.stack);
        });
    });

    function getProperties(req, callback) {
        persist.getPropertiesForClient(req.params.role, function(propsDto) {
            persist.instanceCheckIn(req.params.role, getRemoteIp(req), null, function() {
                callback(propsDto.properties);
            });
        });
    }

    function sendPlainText(res, properties) {
        res.set("Content-Type", "text/plain; charset=UTF-8");
        res.send(properties);
    }

    // Get properties (for client libraries)
    app.get("/api/roles/:role/properties", function(req, res) {
        // JSON for normal people, but without global properties
        if (req.query.hasOwnProperty("json")) {
            persist.getPropertiesForWeb(req.params.role, function(propsDto) {
                res.json(propsDto);
            });
        } else {
            // For Archaius -- as text
            getProperties(req, function(properties) {
                sendPlainText(res, utils.propertiesToTextPlain(properties));
            });
        }
    });

    // Get a specific property
    app.get("/api/roles/:role/properties/:property", function(req, res) {
        trycatch(function() {

            // For web client
            if (req.query.hasOwnProperty("json")) {
                persist.getProperty(req.params.role, req.params.property, function(propsDto) {
                    res.json(propsDto);
                });
            } else {
                getProperties(req, function(properties) {
                    var filteredProperties = utils.filterProperties(properties, req.params.property),
                        prop = filteredProperties.length > 0 ? filteredProperties[0].value : "";
                    sendPlainText(res, prop);
                });
            }

        }, function() {
            res.status(500).send("Failed to fetch property");
        });
    });

    // Get instances by role
    app.get("/api/roles/:role/instances", function(req, res) {
        persist.getInstancesForRole(req.params.role, req.query, function(instances) {
            res.json(instances);
        });
    });

    // Get instances
    app.get("/api/instances", function(req, res) {
        persist.getInstances(req.query, function(instances) {
            res.json(instances);
        });
    });

    function createPropertiesFromWeb(req, res) {
        persist.createProperty(req.params.role, req.body, function(err, property) {
            if (err) {
                res.status(418).json({msg: "Property already exists"});
            }
            res.json(property);
        });
    }

    function createPropertiesFromClient(req, res) {
        var properties = req.body.properties || req.body,
            metadata = req.body.instanceMetadata || {};

        persist.instanceCheckIn(req.params.role, getRemoteIp(req), metadata, function() {
            persist.createProperties(req.params.role, properties, function(properties) {
                res.json(properties);
            });
        });
    }

    // Create properties (from a client library)
    app.post("/api/roles/:role/properties", function(req, res) {
        trycatch(function() {
            if (req.body.properties) {
                createPropertiesFromClient(req, res);
            } else {
                createPropertiesFromWeb(req, res);
            }
        }, function(err) {
            res.status(500).send("Failed to create properties");
            logger.error(err.stack);
        });
    });

    // Delete a property
    app.delete("/api/roles/:role/properties/:property", function(req, res) {
        persist.deleteProperty(req.params.role, req.params.property, function(err, property) {
            if (err) {
                res.json(err);
                return;
            }
            res.json(property);
        });
    });
};