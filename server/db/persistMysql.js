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

var config = {},
    Sequelize = require("sequelize"),
    propertyType = require("../propertyType"),
    mysql = require("mysql"),
    _ = require("lodash"),
    trycatch = require("trycatch"),
    sequelize,
    GLOBAL_ROLE = "global",
    logger = require("../logger"),

    SPECIAL_PROPERTY_PREFIX = "conqueso.",
    POLL_INTEVERAL_META_KEY = "conqueso.poll.interval",

    // Tables
    Property,
    Role,
    Instance,
    InstanceMetadata;

function connect() {
    trycatch(function() {
        var connection = mysql.createConnection(config);
        connection.query("CREATE DATABASE IF NOT EXISTS "+config.databaseName+";");
        connection.end();

        sequelize = new Sequelize(config.databaseName, config.user, config.password, {
            host : config.host,
            port : config.port,
            dialect : "mysql",
            omitNull: true
        });
        logger.info("Successfully connected to database: %s:%s", config.host, config.port);
    }, function(err) {
        logger.error("Failed to connect to database. Make sure your database is running and you have the appropriate permissions.");
        logger.error(err.stack);
    });
}

function createTables() {
    Property = sequelize.define("property", {
        name : Sequelize.STRING,
        value : Sequelize.TEXT,
        type : {
            type : Sequelize.ENUM,
            values : _.pluck(propertyType.enums, "key")
        }
    });

    Role = sequelize.define("role", {
        name : Sequelize.STRING
    });

    Instance = sequelize.define("instance", {
        ip : Sequelize.STRING,
        pollInterval : {
            type : Sequelize.INTEGER,
            defaultValue : 60000
        },
        offline : {
            type : Sequelize.BOOLEAN,
            allowNull : false,
            defaultValue : false
        }
    });

    InstanceMetadata = sequelize.define("instance_metadata", {
        attributeKey : Sequelize.STRING,
        attributeValue : Sequelize.STRING
    });

    Instance.belongsTo(Role);
    Instance.hasMany(InstanceMetadata);

    Role.hasMany(Property, {as : "Properties"});
    Role.hasMany(Instance, {as : "Instances"});

    sequelize.sync().success(function() {
        logger.info("Synchronized with database '%s'.", config.databaseName);
    });
}

// Constructor
var PersistMysql = function(configuration) {
    config = configuration;
    connect();
    createTables();
};

function findRoleByName(roleName, callback) {
    Role.find({ where : { name : roleName }}).success(callback);
}

function findOrCreateRole(roleName, callback) {
    Role.findOrCreate({ name : roleName }).success(callback);
}

// Returns a callback with a list of property models
function getGlobalProperties(filter, callback) {
    findOrCreateRole(GLOBAL_ROLE, function(role) {
        role.getProperties(filter).success(callback);
    });
}

function toJSON(rows) {
    return _.isArray(rows) ? _.pluck(rows, "dataValues") : rows.dataValues;
}

// Get global properites overlayed with role properties
function getCombinedProperties(globalProperties, roleProperties) {
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
}

function getPropertiesDto(roleModel, properties) {
    return {
        name : _.isString(roleModel) ? roleModel : roleModel.dataValues.name,
        properties : properties
    };
}

function getPropertiesForRole(role, filtering, callback) {
    findRoleByName(role, function(role) {
        if (role) {
            role.getProperties(_.extend({order : "name ASC"}, filtering)).success(function(properties) {
                callback(role, properties);
            });
        } else {
            callback(null, []);
        }
    });
}

function isMetadataSame(metadataModels, newMetadata) {
    var attrKeys = [],
        attrValues = [];

    _.each(metadataModels, function(m) {
        attrKeys.push(m.dataValues.attributeKey);
        attrValues.push(m.dataValues.attributeValue);
    });

    // Same -- metadata null is a hack for polling GETs
    return ( _.isEmpty(_.difference(attrKeys, _.keys(newMetadata))) &&
             _.isEmpty(_.difference(attrValues, _.values(newMetadata))) || newMetadata === null);
}

function createInstanceForRole(role, ipAddress, callback) {
    Instance.create({
        ip : ipAddress
    }).success(function(instance) {
        role.addInstance(instance).success(callback);
    });
}

function findOrCreateInstance(roleName, ipAddress, metadata, callback) {
    findOrCreateRole(roleName, function(role) {
        role.getInstances({ where : { ip : ipAddress }, order: "updatedAt DESC", limit : 1}).success(function(instances) {
            var instance;

            if (_.isEmpty(instances)) {
                logger.info("Role does not have any instances. Creating a new instance.", {role:roleName, instance:ipAddress});
                createInstanceForRole(role, ipAddress, callback);
                
            } else {
                instance = instances[0];
                // Check to see if metadata is the same, if it is, service is online
                // and return that instance, otherwise, we need a new instance because
                // it's metadata (version?) has changed
                instance.getInstanceMetadata().success(function(metadatas) {
                    
                    if (isMetadataSame(metadatas, metadata)) {
                        logger.debug("Instance checking in with same metadata. Marking online.", {role:roleName, instance:ipAddress});
                        instance.updateAttributes({ offline : false }).success(callback);
                    
                    // The instance should be offline, create a new one
                    } else {
                        logger.warn("Instance changed metadata! Created new instance.", {role:roleName, instance:ipAddress});
                        createInstanceForRole(role, ipAddress, callback);
                    }
                });
            }
        });
    });
}

function getRoles(callback) {
    Role.findAll({ where : ["name != ?", GLOBAL_ROLE], order : "name ASC",
                   include : [{model : Instance, as : "Instances"}] }).success(function(roles) {

        // Only return instances that are online
        _.map(roles, function(role) {
            role.dataValues.instances = _.filter(role.dataValues.instances, function(instance) {
                return instance.offline === false;
            });
        });
        callback(toJSON(roles));
    });
}

PersistMysql.prototype.getRoles = getRoles;

/* 
 * Returns a list of role to instance ips
 * Example : [{ name : my-service, value : 127.0.0.1,192.168.0.100 }]
 */
function getInstanceIps(callback) {
    var results = [];

    getRoles(function(roles) {
        _.each(roles, function(role) {
            var key = SPECIAL_PROPERTY_PREFIX + role.name + ".ips";
            results.push({
                name  : key,
                value : _.pluck(role.instances, "ip").join(",").replace(/'"/g, "")
            });
        });

        callback(results);
    });
}

PersistMysql.prototype.getPropertiesForWeb = function(roleName, callback) {
    getPropertiesForRole(roleName, {}, function(role, properties) {
        callback(getPropertiesDto(role || roleName, toJSON(properties)));
    });
};

PersistMysql.prototype.getProperty = function(roleName, propertyName, callback) {
    getPropertiesForRole(roleName, {where : {"name" : propertyName}}, function(role, properties) {
        if (properties) {
            logger.debug("Retrieving property for role.", {role:roleName, property:propertyName});
            callback(properties[0].dataValues);
        } else {
            callback({});
        }
    });
};

PersistMysql.prototype.getPropertiesForClient = function(roleName, callback) {
    getGlobalProperties({}, function(globalProperties) {
        getPropertiesForRole(roleName, {}, function(role, properties) {
            getInstanceIps(function(instanceIpProperties) {
                if (role) {
                    callback(getPropertiesDto(role, toJSON(getCombinedProperties(globalProperties, properties))
                                                        .concat(instanceIpProperties) ));
                } else {
                    callback(getPropertiesDto(roleName, []));
                }
            });
        });
    });
};

PersistMysql.prototype.deleteProperty = function(roleName, propertyName, callback) {
    findRoleByName(roleName, function(role) {
        role.getProperties({ where : { name : propertyName }}).success(function(properties) {
            if (properties && properties.length > 0) {
                var prop = properties[0];
                prop.destroy().success(function() {
                    logger.info("Deleted property.", {property : propertyName, role: roleName});
                    callback(toJSON(prop));
                });
            }
        });
    });
};

// Returns a callback with an argument true/false if property already exists
function doesPropertyAlreadyExist(roleName, propertyName, callback) {
    getGlobalProperties({where : {"name" : propertyName}}, function(globalProperties) {
        getPropertiesForRole(roleName, {where : {"name" : propertyName}}, function(role, properties) {
            if (globalProperties && properties && globalProperties.length === 0 && properties.length === 0) {
                callback(false);
            } else {
                callback(true);
            }
        });
    });
}

PersistMysql.prototype.createProperty = function(roleName, property, callback) {
    doesPropertyAlreadyExist(roleName, property.name, function(alreadyExist) {
        if (alreadyExist) {
            callback(new Error("Property already exists"));
        } else {
            findOrCreateRole(roleName, function(role) {
                Property.create({
                    name : property.name,
                    type : propertyType.get(property.type).key,
                    value : property.value
                }).success(function(property) {
                    role.addProperty(property).success(function(property) {
                        logger.info("Created property.", {property: property.dataValues}, {role: roleName});
                        callback(null, toJSON(property));
                    });
                });
            });
        }
    });
};

PersistMysql.prototype.updateProperty = function(roleName, property, callback) {
    getPropertiesForRole(roleName, {where : {"name" : property.name}}, function(role, properties) {
        var prop;
        if (properties) {
            prop = properties[0];
            prop.updateAttributes({ value : property.value }).success(function(property) {
                logger.info("Updated property.", {property: property, role: roleName});
                callback(toJSON(property));
            });
        } else {
            callback({});
        }
    });
};

// Existing properties are models that already exist and properties are the new tuples to be created
function getNewProperties(existingProperties, properties) {
    existingProperties = _.pluck(_.pluck(existingProperties, "dataValues"), "name");
    return _.filter(properties, function(prop) {
        return !_.contains(existingProperties, prop.name);
    });
}

PersistMysql.prototype.createProperties = function(roleName, properties, callback) {
    findOrCreateRole(roleName, function() {
        getGlobalProperties({},function(globalProperties) {
            getPropertiesForRole(roleName, {}, function(role, existingProps) {
                properties = getNewProperties(globalProperties.concat(existingProps), properties);

                // Add the role id to each property
                _.each(properties, function(property) {
                    property.roleId = role.dataValues.id;
                });

                Property.bulkCreate(properties).success(function(props) {
                    logger.info("Created properties for role.", {role : role.dataValues.name, properties:properties});
                    callback(toJSON(props));
                });
            });
        });
    });
};

// Takes an object that has key/value pairs and converts it into a list
// [ {attributeKey : "key", attributeValue : "value"}]
function convertMetadata(metadata, instance) {
    var result = [];
    _.each(_.keys(metadata), function(key) {
        result.push({
            instanceId     : instance.dataValues.id,
            attributeKey   : key,
            attributeValue : metadata[key]
        });
    });
    return result;
}

PersistMysql.prototype.instanceCheckIn = function(roleName, ipAddress, metadata, callback) {
    var updateObj = {
        ip : ipAddress
    };

    if (metadata && metadata[POLL_INTEVERAL_META_KEY]) {
        updateObj.pollInterval = metadata[POLL_INTEVERAL_META_KEY];
    }

    findOrCreateInstance(roleName, ipAddress, metadata, function(instance) {
        // Bumps the UpdatedAt column
        instance.updateAttributes(updateObj).success(function(instance) {
            if (instance.options.isNewRecord) {
                InstanceMetadata.bulkCreate(convertMetadata(metadata, instance)).success(function() {
                    logger.info("Created metadata for instance.", {instance: ipAddress, metdata: metadata});
                    callback(instance);
                });
            } else {
                logger.debug("Instance checking in.", {instance : ipAddress, role: roleName});
                callback(instance);
            }
        });
    });
};

PersistMysql.prototype.markInstancesOffline = function() {
    logger.debug("Checking for instances that have not checked in recently.");
    Instance.findAll({ where : {offline : false} }).success(function(instances) {
        logger.debug("Found %s online instances.", instances.length);
        instances = _.filter(instances, function(instance) {
            var timeSinceUpdate = new Date() - instance.dataValues.updatedAt;
            return timeSinceUpdate > instance.dataValues.pollInterval * 2;
        });

        _.each(instances, function(instance) {
            instance.updateAttributes({
                offline : true
            }).success(function(instance) {
                instance.getRole().success(function(role) {
                    logger.warn("Instance has not checked in recently. Marked offline.",
                        {role : role.dataValues.name, instance : instance.dataValues.ip});
                });
            });
        });
    });
};

PersistMysql.prototype.globalizeProperty = function(property, callback) {
    logger.info("Making property global.", {property: property});
    this.getProperty(property.role, property.name, function(originalProperty) {
        Property.destroy({"name" : property.name}).success(function() {
            Property.create({
                name : originalProperty.name,
                type : propertyType.get(originalProperty.type).key,
                value : originalProperty.value
            }).success(function(property) {
                findOrCreateRole(GLOBAL_ROLE, function(role) {
                    role.addProperty(property).success(callback);
                });
            });
        });
    });
};

module.exports = PersistMysql;
