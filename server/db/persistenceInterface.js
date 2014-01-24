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
PersistenceInterface.prototpe.createProperty = function(err, role, property, callback) {};

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
PersistenceInterface.prototpe.updateProperty = function(role, property, callback) {};

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
PersistenceInterface.prototpe.createProperties = function(role, properties, callback) {};

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
PersistenceInterface.prototpe.deleteProperty = function(role, name, callback) {};

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
PersistenceInterface.prototpe.getPropertiesForWeb = function(role, callback) {};

/**
 * Gets all properties including global ones for a role
 * 
 * @method getPropertiesForClient
 * @param {String} role Role name
 *
 * @param {Function}[callback] callback function
 * @param {Array} callback.properties Properties for role
 **/
PersistenceInterface.prototpe.getPropertiesForClient = function(role, callback) {};

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
PersistenceInterface.prototpe.getProperty = function(role, name, callback) {};

/**
 * Get a list of roles with instances
 * 
 * @method getRoles
 *
 * @param {Function}[callback] callback function
 * @param {Array} callback.roles Role object with instances
 **/
PersistenceInterface.prototpe.getRoles = function(callback) {};

/**
 * Instance ping
 * 
 * @method instanceCheckIn
 * @param {String} role Role name
 * @param {String} ipAddress IP of instance
 *
 * @param {Function}[callback] callback function
 * @param {Object} callback.instance Instance that checked in
 **/
PersistenceInterface.prototpe.instanceCheckIn = function(role, ipAddress, callback) {};

/**
 * Marks instances offline if they have not checked in for 2x their poll interval
 * 
 * @method markInstsancesOffline
 **/
PersistenceInterface.prototpe.markInstsancesOffline = function() {};

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
PersistenceInterface.prototpe.globalizeProperty = function(property, callback) {};

module.exports = new PersistenceInterface();
