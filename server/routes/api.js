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

module.exports = function(express, app, persist) {
    var trycatch = require("trycatch"),
        utils = require("../utils");

    app.use(express.json());
    app.use(express.urlencoded());

    function getRemoteIp(req) {
        return req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    }

    // Get roles
    app.get("/api/roles", function(req, res) {
        persist.getRoles(function(roles) {
            res.json(roles);
        });
    });

    // Get properties (for web interface)
    app.get("/api/roles/:role/properties-web", function(req, res) {
        persist.getPropertiesForWeb(req.params.role, function(propsDto) {
            res.json(propsDto);
        });
    });

    // Get a specific property
    app.get("/api/roles/:role/properties-web/:property", function(req, res) {
        trycatch(function() {
            persist.getProperty(req.params.role, req.params.property, function(propsDto) {
                res.json(propsDto);
            });
        }, function() {
            res.send(500, "Failed to fetch property");
        });
    });

    // Update a specific property
    app.put("/api/roles/:role/properties-web/:property", function(req, res) {
        trycatch(function() {
            persist.updateProperty(req.params.role, req.body, function(property) {
                res.json(property);
            });
        }, function() {
            res.send(500, "Failed to update property");
        });
    });

    // Makes a property global
    app.post("/api/roles/:role/properties-web/:property/globalize", function(req, res) {
        trycatch(function() {
            persist.globalizeProperty(req.body, function() {
                res.json({});
            });
        }, function(err) {
            res.send(500, "Failed to make property global");
            console.log(err.stack);
        });
    });

    // Get properties (for client libraries)
    app.get("/api/roles/:role/properties", function(req, res) {
        persist.getPropertiesForClient(req.params.role, function(propsDto) {
            persist.instanceCheckIn(req.params.role, getRemoteIp(req), null, function() {
                res.header("Content-Type", "text/plain charset=UTF-8");
                res.send(utils.propertiesToTextPlain(propsDto.properties));
            });
        });
    });

    // Create a property (for web interface)
    app.post("/api/roles/:role/properties-web", function(req, res) {
        trycatch(function() {
            persist.createProperty(req.params.role, req.body, function(err, property) {
                if (err) {
                    res.json(418, {msg: "Property already exists"});
                }
                res.json(property);
            });
        }, function(err) {
            res.send(500, "Failed to create property");
            console.log(err.stack);
        });
    });

    // Create properties (from a client library)
    app.post("/api/roles/:role/properties", function(req, res) {
        trycatch(function() {
            var properties = req.body.properties || req.body,
                metadata = req.body.instanceMetadata || {};

            persist.instanceCheckIn(req.params.role, getRemoteIp(req), metadata, function() {
                persist.createProperties(req.params.role, properties, function(properties) {
                    res.json(properties);
                });
            });
        }, function(err) {
            res.send(500, "Failed to create properties");
            console.log(err.stack);
        });
    });

    // Delete a property
    app.delete("/api/roles/:role/properties-web/:property", function(req, res) {
        persist.deleteProperty(req.params.role, req.params.property, function(property) {
            res.json(property);
        });
    });
};