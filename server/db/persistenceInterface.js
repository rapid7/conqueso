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

/* jshint unused:false */

/**
 * Base class for all database persistence
 * 
 * @module PersistenceInterface
 **/

/**
 * Peristence interface
 *
 * @class PersistenceInterface
 * @constructor
**/
var PersistenceInterface = function() {};

/**
 * Creates a new property
 * 
 * @method createProperty
 * @param {Object} err Null if everything is ok
 * @param {String} role Role name
 * @param {Object} property Tuple of property attributes (name, type, value)
 *
 * @param {Function}[callback] callback function
 * @param {Object} callback.property Newly created property
 **/
PersistenceInterface.prototype.createProperty = function(err, role, property, callback) {};

/**
 * Updates a new property
 * 
 * @method updateProperty
 * @param {String} role Role name
 * @param {Object} property Tuple of property attributes (name, type, value)
 *
 * @param {Function}[callback] callback function
 * @param {Object} callback.property Updated property
 **/
PersistenceInterface.prototype.updateProperty = function(role, property, callback) {};

/**
 * Creates properties for a role
 * 
 * @method createProperties
 * @param {String} role Role name
 * @param {Array} properties List of property tuples (name, type, value)
 *
 * @param {Function}[callback] callback function
 * @param {Object} callback.properties Newly created properties
 **/
PersistenceInterface.prototype.createProperties = function(role, properties, callback) {};

/**
 * Delete a property
 * 
 * @method deleteProperty
 * @param {String} role Role name
 * @param {String} name Property name
 *
 * @param {Function}[callback] callback function
 * @param {Object} callback.property Deleted property
 **/
PersistenceInterface.prototype.deleteProperty = function(role, name, callback) {};

/**
 * Get properties DTO for a role. This will not include global properties
 * 
 * @method getPropertiesForWeb
 * @param {String} role Role name
 *
 * @param {Function}[callback] callback function
 * @param {Object} callback.dto Role name with propeties list
 * @example {role : "foo", properties : [{...},{...}]}
 **/
PersistenceInterface.prototype.getPropertiesForWeb = function(role, callback) {};

/**
 * Gets all properties including global ones for a role
 * 
 * @method getPropertiesForClient
 * @param {String} role Role name
 *
 * @param {Function}[callback] callback function
 * @param {Array} callback.properties Properties for role
 **/
PersistenceInterface.prototype.getPropertiesForClient = function(role, callback) {};

/**
 * Get details about a property
 * 
 * @method getProperty
 * @param {String} role Role name
 * @param {String} name Property name
 *
 * @param {Function}[callback] callback function
 * @param {Object} callback.property Property object
 **/
PersistenceInterface.prototype.getProperty = function(role, name, callback) {};

/**
 * Get a list of roles with instances
 * 
 * @method getRoles
 *
 * @param {Function}[callback] callback function
 * @param {Array} callback.roles Role object with instances
 **/
PersistenceInterface.prototype.getRoles = function(callback) {};

/**
 * Get a list of instances with metadata for a role
 * 
 * @method getInstancesForRole
 * @param {String} role Role name
 * @param {Object} query key/value pair to filter instances on
 *
 * @param {Function}[callback] callback function
 * @param {Array} callback.instances List of instances
 **/
PersistenceInterface.prototype.getInstancesForRole = function(role, query, callback) {};

/**
 * Get a list of instances with metadata
 * 
 * @method getInstances
 * @param {Object} query key/value pair to filter instances on
 *
 * @param {Function}[callback] callback function
 * @param {Array} callback.instances List of instances
 **/
PersistenceInterface.prototype.getInstances = function(query, callback) {};

/**
 * Instance ping
 * 
 * @method instanceCheckIn
 * @param {String} role Role name
 * @param {String} ipAddress IP of instance
 *
 * @param {Function}[callback] callback function
 * @param {Object} callback.instance Instance that checked in or null if no role exists
 **/
PersistenceInterface.prototype.instanceCheckIn = function(role, ipAddress, callback) {};

/**
 * Marks instances offline if they have not checked in for 2x their poll interval
 * 
 * @method markInstsancesOffline
 **/
PersistenceInterface.prototype.markInstsancesOffline = function() {};

/**
 * Takes a property, removes it from all roles and adds it as a global property.
 * Note, the value of this property will be whatever value is associated with the property
 * of this role. If there are other roles with the same property name, they will be removed.
 * 
 * @method globalizeProperty
 * @param {Object} property Property to globalize
 *
 * @param {Function}[callback] callback function
 * @param {Object} callback.property Newly creted global property
 **/
PersistenceInterface.prototype.globalizeProperty = function(property, callback) {};

module.exports = new PersistenceInterface();
