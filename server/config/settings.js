/***************************************************************************
 * COPYRIGHT (C) 2013, Rapid7 LLC, Boston, MA, USA.
 * All rights reserved. This material contains unpublished, copyrighted
 * work including confidential and proprietary information of Rapid7.
 **************************************************************************/

/* global __dirname */
var fs = require("fs"),
    nconf = require("nconf"),
    configFile = __dirname + "/settings.json";

nconf.env().file(configFile);

module.exports = {
    getHttpPort: function() {
        return nconf.get("http:port");
    },

    getPersistType: function() {
        return nconf.get("persist:type");
    },

    getPersistConfig: function() {
        return nconf.get("persist:config");
    },

    /*jshint unused:false */
    save: function() {
        nconf.save(function (err) {
            fs.readFile(configFile, function (err, data) {
                console.dir(JSON.parse(data.toString()));
            });
        });
    }
};