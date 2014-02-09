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
var _ = require("lodash");

/**
 * Lots of random goodies
 * 
 * @module Utils
 **/
module.exports = {
    /**
     * Converts a list of property objects to plain text (Java Properties)
     * 
     * @method propertiesToTextPlain
     * @param {Array} properties List of property objects {name:"foo", value:"bar"}
     * @returns {String} Plain text of properties
     **/
    propertiesToTextPlain : function(properties) {
        var result = "";
        _.each(properties, function(property) {
            result += property.name + "=" + property.value + "\n";
        });
        return result.replace(/\s+$/g, "");
    },

    /**
     * Filters down a list of properties with a matching name
     * 
     * @method filterProperties
     * @param {Array} properties List of property objects {name:"foo", value:"bar"}
     * @param {String} name Name of property to filter for
     * @returns {Array} Filtered property list
     **/
    filterProperties : function(properties, name) {
        return _.filter(properties, function(property) {
            return property.name === name;
        });
    }
};