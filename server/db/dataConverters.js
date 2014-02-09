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
 * Utility functions for converting backend models to other data
 * structures for further processing or to return to the client.
 * 
 * @module DataConverters
 **/
var _ = require("lodash"),
    Globals = require("../globals");

module.exports = {
    /**
     * Gets a list of properties that should be created. Properties which already exist for this role
     * will not be created again. Additionally, properties prefixed with Globals.SPECIAL_PROPERTY_PREFIX
     * will be ignored.
     * 
     * @method getNewProperties
     *
     * @param {Array} existingProperties Sequelize models of existing metadata
     * @param {Object} properties Neww properties in JSON format
     * @returns {Array} New properties
     **/
    getNewProperties : function(existingProperties, properties) {
        existingProperties = _.pluck(_.pluck(existingProperties, "dataValues"), "name");
        return _.filter(properties, function(prop) {
            return !_.contains(existingProperties, prop.name) &&
                prop.name.lastIndexOf(Globals.SPECIAL_PROPERTY_PREFIX, 0) !== 0;
        });
    },

    /**
     * Combines global and role properties into a single array. Global properties
     * take prescedence over role properties.
     * 
     * @method getCombinedProperties
     *
     * @param {Array} globalProperties Sequelize models of global properties
     * @param {Array} roleProperties Sequelize models of role properties
     * @returns {Array} Array of combined models
     **/
    getCombinedProperties : function(globalProperties, roleProperties) {
        var properties = globalProperties;

        _.each(roleProperties, function(roleProp) {
            var result = _.filter(properties, function(property){
                return property.dataValues.name === roleProp.dataValues.name;
            });

            // Add the global global property
            if (result.length === 0) {
                properties.push(roleProp);
            }
        });

        return properties;
    },

    /**
     * Converts one or more Sequelize models to flattened JSON objects
     * 
     * @method toJSON
     *
     * @param {Object} rows Sequelize models to flatten out dataValues 
     * @returns {Array|Object} Array of JSON properties
     **/
    toJSON : function(rows) {
        return _.isArray(rows) ? _.pluck(rows, "dataValues") : rows.dataValues;
    },

    /**
     * Takes an object that has key/value pairs and converts it into a list
     * 
     * @method convertMetadata
     * @example [{attributeKey : "key", attributeValue : "value"}]
     *
     * @param {Object} metadata Key/value metadata object
     * @param {Object} instance
     * @returns {Array} Converted metadatas
     **/
    convertMetadata : function(metadata, instance) {
        var result = [];
        _.each(_.keys(metadata), function(key) {
            result.push({
                instanceId     : instance.dataValues.id,
                attributeKey   : key,
                attributeValue : metadata[key]
            });
        });
        return result;
    },

    /**
     * Compares metadata that exists and an object of new metadata. Metadata sameness 
     * is based on all keys and all values matching.
     * 
     * @method isMetadataSame
     * @private
     * @param {Array} metadataModels Sequelize models of existing metadata
     * @param {Object} newMetadata New metadata being sent from a client
     * @returns {Boolean}
     **/
    isMetadataSame : function(metadataModels, newMetadata) {
        var attrKeys = [],
            attrValues = [];

        _.each(metadataModels, function(m) {
            attrKeys.push(m.dataValues.attributeKey);
            attrValues.push(m.dataValues.attributeValue);
        });

        return ( _.isEmpty(_.difference(attrKeys, _.keys(newMetadata))) &&
                 _.isEmpty(_.difference(attrValues, _.values(newMetadata))) || newMetadata === null);
    },

    /**
     * Returns a new object with lower case keys and values (if that value is a string)
     * 
     * @method lowerKeysValues
     * @param {Object} obj Object to lower case
     * @returns {Object} New object with lowered keys and values
     **/
    lowerKeysValues : function(obj) {
        var newObj = {};
        _.each(_.keys(obj), function(key) {
            var value = obj[key];
            newObj[key.toLowerCase()] = _.isString(value) ? value.toLowerCase() : value;
        });
        return newObj;
    },

    /**
     * Filters down a list of instances based on metadata key/values. Additionally,
     * if 'ip' is in the filter data, then the list will filter to that IP.
     * 
     * @method filterInstancesByMetadata
     *
     * @param {Array} instances List of instance DTOs with metadata
     * @param {Object} metadataFilter Object of key:value pairs which must match
     * @returns {Array} Filtered instances
     **/
    filterInstancesByMetadata : function(instances, metadataFilter) {
        metadataFilter = this.lowerKeysValues(metadataFilter);
        return _.filter(instances, function(instance) {
            for (var key in metadataFilter) {
                if (!(instance.metadata.hasOwnProperty(key) &&
                      instance.metadata[key] === metadataFilter[key])) {
                    return false;
                }
            }
            return true;
        });
    },

    /**
     * Converts a role and properties into a flatten JSON object used as a DTO
     * 
     * @method getPropertiesDto
     * @private
     * @param {Object|String} role Sequelize model or String
     * @param {Array} properties Array of Sequelize model properties
     * @returns {Object} DTO of role and properties
     **/
    getPropertiesDto : function(role, properties) {
        return {
            name : _.isString(role) ? role : role.dataValues.name,
            properties : properties
        };
    },

    /**
     * Converts a role and instance data into a flatten JSON object used as a DTO
     * 
     * @method getInstanceDto
     * @private
     * @example
     *     [{
              "role": "foo",
              "ip": "10.1.100.78",
                "metadata": {
                  "ami-id" : "ami-133cb31d",
                  "availability-zone" : "us-east-1d"
                }
            }]
     * @param {String} role Name of role. If null, will try to pull out the role
     *                 name from the instance.
     * @param {Array} instanceData Array of instance JSON with metadata
     * @returns {Array} DTO of instances with metadata
     **/
    getInstanceDto : function(role, instanceData) {
        return _.reduce(instanceData, function(output, instance) {
            output.push({
                role : (instance.role ? instance.role.dataValues.name : role),
                ip : instance.ip,
                pollInterval: instance.pollInterval,
                createdAt : instance.createdAt,
                updatedAt : instance.updatedAt,
                metadata : _.reduce(instance.metadata, function(result, data) {
                    result[data.attributeKey] = data.attributeValue;
                    return result;
                }, {})
            });
            return output;
        }, []);
    },

    /**
     * Creates role DTOs with instance counts
     * 
     * @method getRoleDto
     * @private
     * @example
     *     [{
              "name": "foo",
              "instance" : 3
            }]
     * @param {Array} roles Array of JSON roles
     * @returns {Array} DTO of roles with instance counts
     **/
    getRoleDto : function(roles) {
        return _.reduce(roles, function(output, role) {
            output.push({
                name : role.name,
                instances : role.instances.length
            });
            return output;
        }, []);
    }
};