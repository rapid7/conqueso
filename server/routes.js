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
            "name": "attribution-service",
            "instances": [{
                "id": "i49217",
                "ip-internal": "10.10.1.100"
            }]
        },
        {
            "name": "behavior-generation-service",
            "instances": [{
                "id": "i38304",
                "ip-internal": "10.10.1.222"
            }]
        }]);
    });

    app.get("/api/roles/:id/properties", function(req, res) {
        console.log("getting properties for role: " + req.params.id);

        res.json({
            "id" : req.params.id,
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

    // Application
    app.use("/", express.static(__dirname + "/../client"));
};