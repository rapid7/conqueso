/***************************************************************************
 * COPYRIGHT (C) 2014, Rapid7 LLC, Boston, MA, USA.
 * All rights reserved. This material contains unpublished, copyrighted
 * work including confidential and proprietary information of Rapid7.
 **************************************************************************/

module.exports = function(express, app, persist) {
    app.use(express.json());
    app.use(express.urlencoded());

    // API
    app.get("/api/roles", function(req, res) {
        persist.getRoles(function(roles) {
            res.json(roles);
        });
    });

    // Get properties (for web interface)
    app.get("/api/roles/:role/properties/web", function(req, res) {
        persist.getProperties(req.params.role, function(properties) {
            res.json(properties);
        });
    });

    // Get properties (for client libraries)
    app.get("/api/roles/:role/properties", function(req, res) {
        persist.getProperties(req.params.role, function(properties) {
            res.json(properties);
        });
    });

    // Creating a single property
    app.post("/api/roles/:role/properties", function(req, res) {
        persist.createProperty(req.params.role, req.body.key, req.body.type, req.body.value, function(property) {
            res.json(property);
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