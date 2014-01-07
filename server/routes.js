/***************************************************************************
 * COPYRIGHT (C) 2014, Rapid7 LLC, Boston, MA, USA.
 * All rights reserved. This material contains unpublished, copyrighted
 * work including confidential and proprietary information of Rapid7.
 **************************************************************************/

/* global __dirname */
module.exports = function(express, app, persist) {
    app.use(express.bodyParser());

    // API
    app.get("/api/roles", function(req, res) {
        /*res.json([{
            "name": "cronjob-service",
            "instances": [{
                "id": "i49217",
                "ip-internal": "10.10.1.100"
            }]
        },
        {
            "name": "foo-service",
            "instances": []
        },
        {
            "name": "interface-service",
            "instances": [{
                "id": "i38304",
                "ip-internal": "10.10.1.222"
            }]
        }
        ]);*/

        persist.getRoles(function(roles) {
            res.json(roles);
        });
    });

    app.get("/api/roles/:role/properties", function(req, res) {
        persist.getProperties(req.params.role, function(properties) {
            res.json({
                name : req.params.role,
                properties : properties
            });
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