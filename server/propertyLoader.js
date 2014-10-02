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
 * Loads in properties from a JSON file to load into Conqueso
 * 
 * @module PropertyLoader
 **/

var fs = require("fs"),
    logger = require("./logger");

/**
 * Loads and parses a JSON file
 * 
 * @method connect
 * @private
 * @param {String} file File to load
 * @return {Object} Resulting JSON
 **/
function loadJsonFile(file) {
    var data = fs.readFileSync(file, "utf8");
    try {
        data = JSON.parse(data);
    } catch(error) {
        throw new Error("Failed to parse defaults file");
    }
    return data;
}

module.exports = function(persistence, defaultsFile) {
    var _ = require("lodash"),
        loadFile = defaultsFile || (__dirname + "/config/defaults.json");

    fs.exists(loadFile, function(exists) {
        if (exists) {
            logger.info("Defaults file exists. Creating default properties.");
            _.each(loadJsonFile(loadFile), function(item) {
                try {
                    // Asynchronously create properties
                    persistence.createProperties(item.role, item.properties, function() {});
                } catch(err) {
                    throw new Error("Failed to create properties");
                }
            });
        }
    });
};