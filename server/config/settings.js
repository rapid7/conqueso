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

/**
 * Get server settings from settings.json. Some settings, database connection parameters
 * in particular can be overriden by environment variables.
 * 
 * @module settings
 **/

var nconf = require("nconf"),
    configFile = __dirname + "/settings.json";

nconf.env().file(configFile);

module.exports = {
    getHttpPort: function() {
        return nconf.get("http:port");
    },

    getPersistType: function() {
        return nconf.get("db:type");
    },

    getDbConfig: function() {
        return {
            host          : process.env.RDS_HOSTNAME || nconf.get("db:config:host"),
            port          : process.env.RDS_PORT || nconf.get("db:config:port"),
            user          : process.env.RDS_USERNAME || nconf.get("db:config:user"),
            password      : process.env.RDS_PASSWORD || nconf.get("db:config:password"),
            databaseName  : nconf.get("db:config:databaseName"),
            pool          : {
                maxConnections : parseInt(nconf.get("db.config.pool.maxConnections"), 10),
                maxIdleTime : parseInt(nconf.get("db.config.pool.maxIdleTime"), 10)
            },
        };
    },

    getPropertiesPollInterval: function() {
        return nconf.get("properties:pollIntervalSecs");
    },

    getLogLevel: function() {
        return nconf.get("logging:level");
    },

    getLogDirectory: function() {
        return nconf.get("logging:dir");
    },

    getLogOutputFile: function() {
        return nconf.get("logging:file");
    }
};
