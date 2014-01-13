/***************************************************************************
 * COPYRIGHT (C) 2014, Rapid7 LLC, Boston, MA, USA.
 * All rights reserved. This material contains unpublished, copyrighted
 * work including confidential and proprietary information of Rapid7.
 **************************************************************************/

module.exports = function(express, app, persist) {
    var _ = require("lodash"),
        trycatch = require("trycatch"),
        utils = require("./utils");

    app.use(express.json());
    app.use(express.urlencoded());

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

    // Get properties (for client libraries)
    app.get("/api/roles/:role/properties", function(req, res) {
        persist.getPropertiesForClient(req.params.role, function(propsDto) {
            res.header("Content-Type", "text/plain charset=UTF-8");
            res.send(utils.propertiesToTextPlain(propsDto.properties));
        });
    });

    // Create properties
    app.post("/api/roles/:role/properties", function(req, res) {
        trycatch(function() {
            // List from a client
            if (_.isArray(req.body)) {
                persist.createProperties(req.params.role, req.body, function(properties) {
                    res.json(properties);
                });
            // Single property -- usually from web client
            } else if (_.isObject(req.body)) {
                persist.createProperty(req.params.role, req.body, function(property) {
                    res.json(property);
                });
            } else {
                res.send(500, "Invalid input");
            }
        }, function(err) {
            res.send(500, "Sorry -- something went wrong");
            console.log(err.stack);
        });
    });

    // Delete a property
    app.delete("/api/roles/:role/properties/:property", function(req, res) {
        persist.deleteProperty(req.params.role, req.params.property, function(property) {
            res.json(property);
        });
    });

    // Application
    app.use("/", express.static(__dirname + "/../client"));
};