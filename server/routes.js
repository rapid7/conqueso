/***************************************************************************
 * COPYRIGHT (C) 2013, Rapid7 LLC, Boston, MA, USA.
 * All rights reserved. This material contains unpublished, copyrighted
 * work including confidential and proprietary information of Rapid7.
 **************************************************************************/

/* global __dirname */
module.exports = function(express, app) {
    // API
    app.get("/api/roles", function(req, res) {
        res.json([{
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
        ]);
    });

    app.get("/api/roles/:role/properties", function(req, res) {
        res.json({
            "id" : req.params.role,
            "role" : req.params.role,
            "properties" : [{
                "name" : "config-property-1",
                "type" : "STRING",
                "value" : "123456"
            }, {
                "name" : "someothervalue",
                "type" : "float",
                "value" : "858.23"
            }]
        });
    });

    app.post("/api/roles/:role/properties/:property", function(req, res) {
        res.json({});
    });

    app.delete("/api/roles/:role/properties/:property", function(req, res) {
        res.json({});
    });

    // Application
    app.use("/", express.static(__dirname + "/../client"));
};