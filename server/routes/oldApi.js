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
        logger = require("../logger");

    // Get properties (for web interface)
    app.get("/api/roles/:role/properties-web", function(req, res) {
        persist.getPropertiesForWeb(req.params.role, function(propsDto) {
            res.json(propsDto);
        });
    });

    // Update a specific property
    app.put("/api/roles/:role/properties-web/:property", function(req, res) {
        trycatch(function() {
            persist.updateProperty(req.params.role, req.body, function(err, property) {
                if (err) {
                    res.json(err);
                    return;
                }
                res.json(property);
            });
        }, function() {
            res.status(500).send("Failed to update property");
        });
    });

    // Makes a property global
    app.post("/api/roles/:role/properties-web/:property/globalize", function(req, res) {
        trycatch(function() {
            persist.globalizeProperty(req.body, function() {
                res.json({});
            });
        }, function(err) {
            res.status(500).send("Failed to make property global");
            logger.error(err.stack);
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
            res.status(500).send("Failed to create property");
            logger.error(err.stack);
        });
    });

    // Delete a property (client)
    app.delete("/api/roles/:role/properties-web/:property", function(req, res) {
        persist.deleteProperty(req.params.role, req.params.property, function(err, property) {
            if (err) {
                res.json(err);
                return;
            }
            res.json(property);
        });
    });
};