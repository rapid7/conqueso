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
 * Database connnection, persistence and DAOs for MySQL
 * 
 * @module PersistenceServiceMysql
 **/
var sequelize,
    Sequelize = require("sequelize"),
    _         = require("lodash"),

    DataUtils    = require("./dataConverters"),
    PropertyType = require("../propertyType"),
    logger       = require("../logger"),
    Globals      = require("../globals"),

    // Used for migration
    exec = require("child_process").exec,

    // Tables
    Property,
    Role,
    Instance,
    InstanceMetadata;


/**
 * Returns a MySQL connection URL based on a configuration object
 * 
 * @method getConnectionUrl
 * @private
 * @param {Object} configuration object to use to connect
 * @returns {String} Connection URL
 **/
function getConnectionUrl(config) {
    return "mysql://" + config.user + ":" + config.password + "@" +
                        config.host + ":" + config.port + "/" + config.databaseName;
}

/**
 * Connects to the database and initializes the Sequelize object
 * 
 * @method setup
 * @private
 * @param {Object} configuration object to use to connect
 * @param {Function}[callback] callback function
 **/
function setup(config, callback) {
    sequelize = new Sequelize(config.databaseName, config.user, config.password, {
        host : config.host,
        port : config.port,
        dialect : config.dialect || "mysql",
        logging : logger.debug,
        omitNull: true
    });
    callback();
}

/**
 * Initialize connection to SQL
 * 
 * @method connect
 * @private
 * @param {Object} configuration object to use to connect
 * @param {Function}[done] callback function for when this has finished
 **/
function connect(config, done) {
    try {
        // Only create a database and migrate it if it is specified
        if (config.databaseName) {
            var connection = require("mysql").createConnection(config);
            connection.query("CREATE DATABASE IF NOT EXISTS "+config.databaseName+";", function(err) {
                if (!err) {
                    logger.info("Successfully connected to database: %s:%s", config.host, config.port);
                } else {
                    throw new Error("Failed to connect to database");
                }
            });
            connection.end();

            // Migrate to the latest schema
            var bin = __dirname + "/../../node_modules/sequelize/bin/sequelize";
            require("fs").chmodSync(bin, 0755);
            exec(bin + " -m -U " + getConnectionUrl(config), function(err) {
                if (!err) {
                    logger.info("Migrated database schema to latest version");
                    setup(config, done);
                } else {
                    throw new Error("Failed to migrate database schema");
                }
            });
        // If no database is specified just setup Sequelize and don't migrate
        } else {
            setup(config, done);
        }

    } catch (err) {
        logger.error(err);
        throw err;
    }
}

/**
 * Create SQL tables and associations
 * 
 * @method createTables
 * @private
 * @param {Function}[done] callback function for when this has finished
 **/
function createTables(done) {
    Property = sequelize.define("property", {
        name : Sequelize.STRING,
        value : Sequelize.TEXT,
        type : {
            type : Sequelize.ENUM,
            values : _.pluck(PropertyType.enums, "key")
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
    Instance.hasMany(InstanceMetadata, {as : "Metadata"});

    Role.hasMany(Property, {as : "Properties"});
    Role.hasMany(Instance, {as : "Instances"});

    sequelize.sync().success(function() {
        logger.info("Synchronized with database");
        done();
    });
}

/**
 * Connects to a MySQL database and provides DAO methods
 *
 * @class PersistenceServiceMysql
 * @param {Object} configuration Parameters for connecting to the database
 * @extends PeristenceInterface
 * @constructor
 **/
var PersistenceServiceMysql = function(configuration, done) {
    connect(configuration, function() {
        createTables(done);
    });
};

/**
 * Get a role object
 * 
 * @method findRoleByName
 * @private
 * @param {String} roleName Name of the role
 *
 * @param {Function}[callback] callback function
 * @param {Object} callback.role The role object
 **/
function findRoleByName(roleName, callback) {
    Role.find({ where : { name : roleName }}).success(callback);
}

/**
 * Get a role object or creates it if it doesn't exist
 * 
 * @method findOrCreateRole
 * @private
 * @param {String} roleName Name of the role
 *
 * @param {Function}[callback] callback function
 * @param {Object} callback.role The role object
 **/
function findOrCreateRole(roleName, callback) {
    Role.findOrCreate({ name : roleName }).success(callback);
}

/**
 * Gets a list of property models for the "global" role
 * 
 * @method getGlobalProperties
 * @private
 * @param {Object} filter Filter properties that are retrieved using Sequelize syntax.
 *      Example: {where : {"name" : "foo"}}
 *
 * @param {Function}[callback] callback function
 * @param {Array} callback.properties Array of properties
 **/
function getGlobalProperties(filter, callback) {
    findOrCreateRole(Globals.GLOBAL_ROLE, function(role) {
        role.getProperties(filter).success(callback);
    });
}

/**
 * Gets properties for a particular role
 * 
 * @method getPropertiesForRole
 * @private
 * @param {String} role Role name
 * @param {Object} filter Filter properties that are retrieved using Sequelize syntax.
 *      Example: {where : {"name" : "foo"}}
 *
 * @param {Function}[callback] callback function
 * @param {Object} callback.role Role
 * @param {Array} callback.properties Array of properties
 **/
function getPropertiesForRole(role, filter, callback) {
    findRoleByName(role, function(role) {
        if (role) {
            role.getProperties(_.extend({order : "name ASC"}, filter)).success(function(properties) {
                callback(role, properties);
            });
        } else {
            callback(null, []);
        }
    });
}

/**
 * Creates a new intance for a role
 * 
 * @method createInstanceForRole
 * @private
 * @param {String} role Role name
 * @param {String} ipAddress IP of the instance
 *
 * @param {Function}[callback] callback function
 * @param {Object} callback.instance Newly created instance
 **/
function createInstanceForRole(role, ipAddress, callback) {
    Instance.create({
        ip : ipAddress
    }).success(function(instance) {
        role.addInstance(instance).success(callback);
    });
}

/**
 * Gets an instance for a role by IP if it already exists. If the metadata for this instance has
 * not changed, then mark the instance online. If it has changed, then create a new instance. If the
 * role has no instance with this IP, then create a new instance.
 * 
 * @method findOrCreateInstance
 * @private
 * @param {String} roleName Role name
 * @param {String} ipAddress IP of the instance
 * @param {Object} metadata Key/value object of metadata attributes
 *
 * @param {Function}[callback] callback function
 * @param {Object} callback.instance Newly created instance or null if no role exists for this name
 **/
function findOrCreateInstance(roleName, ipAddress, metadata, callback) {
    // Create a global role if it doesn't exist. Don't create roles for null metadata.
    var getRole = (roleName === Globals.GLOBAL_ROLE || metadata !== null) ? findOrCreateRole : findRoleByName;
    getRole(roleName, function(role) {
        if (!role) {
            logger.warn("No role associated with name.", {role : roleName});
            callback(null);
            return;
        }

        if (roleName === Globals.GLOBAL_ROLE) {
            logger.info("Not creating instance for this role. " +
                        "his typically happens when the global API is hit directly", {role : roleName});
            callback(null);
            return;
        }

        role.getInstances({ where : { ip : ipAddress }, order: "updatedAt DESC", limit : 1}).success(function(instances) {
            var instance;

            if (_.isEmpty(instances)) {
                logger.info("Role does not have any instances. Creating a new instance.", {role:roleName, instance:ipAddress});
                createInstanceForRole(role, ipAddress, callback);
                
            } else {
                instance = instances[0];
                instance.getMetadata().success(function(metadatas) {
                    
                    if (DataUtils.isMetadataSame(metadatas, metadata)) {
                        logger.debug("Instance checking in with same metadata. Marking online.", {role:roleName, instance:ipAddress});
                        instance.updateAttributes({ offline : false }).success(callback);
                    
                    } else {
                        logger.warn("Instance changed metadata! Created new instance.", {role:roleName, instance:ipAddress});
                        createInstanceForRole(role, ipAddress, callback);
                    }
                });
            }
        });
    });
}

/**
 * Get all non-global roles. Includes instances that are online.
 * 
 * @method getRoles
 * @private
 *
 * @param {Function}[callback] callback function
 * @param {Array} callback.instance JSON objects of roles with instances
 **/
function getRoles(callback) {
    Role.findAll({ where : ["name != ?", Globals.GLOBAL_ROLE], order : "name ASC",
                   include : [{model : Instance, as : "Instances"}] }).success(function(roles) {

        // Only return instances that are online
        _.map(roles, function(role) {
            role.dataValues.instances = _.filter(role.dataValues.instances, function(instance) {
                return instance.offline === false;
            });
        });
        callback(DataUtils.toJSON(roles));
    });
}

/**
 * Gets an array of pseudo properties which map a role to a list of it's online
 * instance ips. 
 * 
 * @method getInstanceIps
 * @private
 * @example [{ name : my-service, value : 127.0.0.1,192.168.0.100 }]
 *
 * @param {Function}[callback] callback function
 * @param {Array} callback.instance JSON objects of instance ip properties
 **/
function getInstanceIps(callback) {
    var results = [];

    getRoles(function(roles) {
        _.each(roles, function(role) {
            var key = Globals.SPECIAL_PROPERTY_PREFIX + role.name + ".ips";
            results.push({
                name  : key,
                value : _.pluck(role.instances, "ip").join(",").replace(/'"/g, "")
            });
        });

        callback(results);
    });
}

// Returns a callback with an argument true/false if property already exists

/**
 * Checks to see if a given property for a role already exists
 * 
 * @method doesPropertyAlreadyExist
 * @private
 * @param {String} roleName Role name
 * @param {String} propertyName Property name
 *
 * @param {Function}[callback] callback function
 * @param {Boolean} callback.alreadyExist True if property already exists
 **/
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

/* @Override */
PersistenceServiceMysql.prototype.getRoles = function(callback) {
    getRoles(function(roles) {
        callback(DataUtils.getRoleDto(roles));
    });
};

/* @Override */
PersistenceServiceMysql.prototype.getInstances = function(roleName, callback) {
    findRoleByName(roleName, function(role) {
        if (!role) {
            return callback([]);
        }

        role.getInstances({ where : {offline : false}, order : "attributeKey ASC",
                            include : [{model : InstanceMetadata, as : "Metadata"}] }).success(function(instances) {
            callback(DataUtils.getInstanceDto(roleName, DataUtils.toJSON(instances)));
        });
    });
};

/* @Override */
PersistenceServiceMysql.prototype.getPropertiesForWeb = function(roleName, callback) {
    getPropertiesForRole(roleName, {}, function(role, properties) {
        callback(DataUtils.getPropertiesDto(role || roleName, DataUtils.toJSON(properties)));
    });
};

/* @Override */
PersistenceServiceMysql.prototype.getProperty = function(roleName, propertyName, callback) {
    getPropertiesForRole(roleName, {where : {"name" : propertyName}}, function(role, properties) {
        if (properties) {
            logger.debug("Retrieving property for role.", {role:roleName, property:propertyName});
            callback(properties[0].dataValues);
        } else {
            callback({});
        }
    });
};

/* @Override */
PersistenceServiceMysql.prototype.getPropertiesForClient = function(roleName, callback) {
    getGlobalProperties({}, function(globalProperties) {
        getPropertiesForRole(roleName, {}, function(role, properties) {
            getInstanceIps(function(instanceIpProperties) {
                var resultingProperties = [];

                if (role) {
                    resultingProperties = DataUtils.getCombinedProperties(globalProperties, properties);
                } else {
                    role = roleName;
                    resultingProperties = globalProperties;
                }

                callback(DataUtils.getPropertiesDto(role, DataUtils.toJSON(resultingProperties)
                                                                   .concat(instanceIpProperties)));
            });
        });
    });
};

/* @Override */
PersistenceServiceMysql.prototype.deleteProperty = function(roleName, propertyName, callback) {
    findRoleByName(roleName, function(role) {
        role.getProperties({ where : { name : propertyName }}).success(function(properties) {
            if (properties && properties.length > 0) {
                var prop = properties[0];
                prop.destroy().success(function() {
                    logger.info("Deleted property.", {property : propertyName, role: roleName});
                    callback(DataUtils.toJSON(prop));
                });
            }
        });
    });
};

/* @Override */
PersistenceServiceMysql.prototype.createProperty = function(roleName, property, callback) {
    doesPropertyAlreadyExist(roleName, property.name, function(alreadyExist) {
        if (alreadyExist) {
            callback(new Error("Property already exists"));
        } else {
            findOrCreateRole(roleName, function(role) {
                Property.create({
                    name : property.name,
                    type : PropertyType.get(property.type).key,
                    value : property.value
                }).success(function(property) {
                    role.addProperty(property).success(function(property) {
                        logger.info("Created property.", {property: property.dataValues}, {role: roleName});
                        callback(null, DataUtils.toJSON(property));
                    });
                });
            });
        }
    });
};

/* @Override */
PersistenceServiceMysql.prototype.updateProperty = function(roleName, property, callback) {
    getPropertiesForRole(roleName, {where : {"name" : property.name}}, function(role, properties) {
        var prop;
        if (properties) {
            prop = properties[0];
            prop.updateAttributes({ value : property.value }).success(function(property) {
                logger.info("Updated property.", {property: property, role: roleName});
                callback(DataUtils.toJSON(property));
            });
        } else {
            callback({});
        }
    });
};

/* @Override */
PersistenceServiceMysql.prototype.createProperties = function(roleName, properties, callback) {
    findOrCreateRole(roleName, function() {
        sequelize.transaction(function(t) {
            getGlobalProperties({transaction : t},function(globalProperties) {
                getPropertiesForRole(roleName, {transaction : t}, function(role, existingProps) {
                    properties = DataUtils.getNewProperties(globalProperties.concat(existingProps), properties);

                    // Add the role id to each property
                    _.each(properties, function(property) {
                        property.roleId = role.dataValues.id;
                    });

                    Property.bulkCreate(properties, {transaction: t}).success(function(props) {
                        logger.info("Created properties for role.", {role : role.dataValues.name, properties:properties});
                        t.commit().success(Function);
                        callback(DataUtils.toJSON(props));
                    }).error(function(err) {
                        logger.error(err);
                        t.rollback().success(Function);
                    });
                });
            });
        });
    });
};

/* @Override */
PersistenceServiceMysql.prototype.instanceCheckIn = function(roleName, ipAddress, metadata, callback) {
    var updateObj = {
        ip : ipAddress
    };

    if (metadata && metadata[Globals.POLL_INTEVERAL_META_KEY]) {
        updateObj.pollInterval = metadata[Globals.POLL_INTEVERAL_META_KEY];
    }

    findOrCreateInstance(roleName, ipAddress, metadata, function(instance) {
        if (!instance) {
            callback(null);
            return;
        }
        
        sequelize.transaction(function(t) {
            // Bumps the UpdatedAt column
            instance.updateAttributes(updateObj, {transaction: t}).success(function(instance) {
                if (instance.options.isNewRecord) {
                    InstanceMetadata.bulkCreate(DataUtils.convertMetadata(metadata, instance), {transaction: t}).success(function() {
                        t.commit().success(function() {
                            logger.info("Created metadata for instance.", {instance: ipAddress, metadata: metadata});
                        });
                        callback(instance);
                    });
                } else {
                    t.commit().success(Function);
                    logger.debug("Instance checking in.", {instance : ipAddress, role: roleName});
                    callback(instance);
                }
            }).error(function(err) {
                t.commit().rollback(function() {
                    logger.error(err);
                });
            });
        });
    });
};

/* @Override */
PersistenceServiceMysql.prototype.markInstancesOffline = function() {
    logger.debug("Checking for instances that have not checked in recently.");
    
    sequelize.transaction(function(t) {
        Instance.findAll({ where : {offline : false}, transaction : t }).success(function(instances) {
            var ids = [];

            logger.debug("Found %s online instances.", instances.length);
            
            instances = _.filter(instances, function(instance) {
                var timeSinceUpdate = new Date() - instance.dataValues.updatedAt;
                return timeSinceUpdate > instance.dataValues.pollInterval * 2;
            });

            ids = _.pluck(_.pluck(instances, "dataValues"), "id");

            if (instances && instances.length > 0) {
                Instance.update({offline : true}, { id : ids}, {transaction : t}).success(function() {
                    _.each(instances, function(instance) {
                        // Update already occurred logging can happen outside of transaction
                        instance.getRole().success(function(role) {
                            logger.warn("Instance has not checked in recently. Marked offline.",
                                {instance : instance.dataValues.ip, role: role.name });
                        });
                    });

                    t.commit().success(Function);
                }).error(function(err) {
                    logger.error(err);
                    t.commit().rollback(Function);
                });
            } else  {
                t.commit().success(Function);
            }
        });
    });
};

/* @Override */
PersistenceServiceMysql.prototype.globalizeProperty = function(property, callback) {
    logger.info("Making property global.", {property: property});
    
    this.getProperty(property.role, property.name, function(originalProperty) {
        Property.destroy({"name" : property.name}).success(function() {
            Property.create({
                name : originalProperty.name,
                type : PropertyType.get(originalProperty.type).key,
                value : originalProperty.value
            }).success(function(property) {
                findOrCreateRole(Globals.GLOBAL_ROLE, function(role) {
                    role.addProperty(property).success(callback);
                });
            });
        });
    });
};

module.exports = PersistenceServiceMysql;
