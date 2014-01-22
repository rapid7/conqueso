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

var fs = require("fs"),
    nconf = require("nconf"),
    configFile = __dirname + "/settings.json";

nconf.env().file(configFile);

module.exports = {
    getHttpPort: function() {
        return nconf.get("http:port");
    },

    getPersistType: function() {
        return nconf.get("db:type");
    },

    /* global process */
    getDbConfig: function() {
        return {
            host          : process.env.RDS_HOSTNAME || nconf.get("db:config:host"),
            port          : process.env.RDS_PORT || nconf.get("db:config:port"),
            user          : process.env.RDS_USERNAME || nconf.get("db:config:user"),
            password      : process.env.RDS_PASSWORD || nconf.get("db:config:password"),
            databaseName  : nconf.get("db:config:databaseName")
        };
    },

    getPropertiesPollInterval: function() {
        return nconf.get("properties:pollInteveralSecs");
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