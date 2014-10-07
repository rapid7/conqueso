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

    // Tables
    Property,
    Role,
    Instance,
    InstanceMetadata;


/**
 * Initialize the Sequelize object
 * 
 * @method initSequelize
 * @private
 * @param {Object} configuration object to use to connect
 **/
function initSequelize(config) {
    sequelize = new Sequelize(config.databaseName, config.user, config.password, {
        host : config.host,
        port : config.port,
        pool : config.pool,
        dialect : config.dialect || "mysql",
        logging : logger.debug,
        omitNull: true
    });
}

/**
 * Creates the conqueso database if it does not already exist
 * 
 * @method createDatabase
 * @private
 * @param {Object} configuration object to use to connect
 **/
function createDatabase(config) {
    var connection = require("mysql").createConnection(config);
    connection.query("CREATE DATABASE IF NOT EXISTS " + config.databaseName + ";", function(err) {
        if (err) {
            logger.error("Failed to connect to database.", err);
        } else {
            logger.info("Successfully connected to database: %s:%s", config.host, config.port);
        }
    });
    connection.end();
}

/**
 * Migrates the database to the latest schema version
 * 
 * @method migrate
 * @private
 * @param {Function}[done] done callback function
 **/
function migrate(done) {
    sequelize.getMigrator({
        path : process.cwd() + "/migrations",
        logging : logger.info
    })
    .migrate()
    .success(done)
    .error(function(err) {
        logger.error(err);
        throw err;
    });
}

/**
 * Connects to the database and initializes the Sequelize object
 * 
 * @method connect
 * @private
 * @param {Object} configuration object to use to connect
 * @param {Function}[callback] callback function
 **/
function connect(config, callback) {
    if (config.databaseName) {
        createDatabase(config);
        initSequelize(config);
        migrate(callback);
    } else {
        initSequelize(config);
        callback();
    }
}

/**
 * Create SQL tables and associations
 * 
 * @method createTables
 * @private
 **/
function createTables() {
    Property = sequelize.define("property", {
        name : {
            type : Sequelize.STRING,
            allowNull : false
        },
        value : {
            type: Sequelize.TEXT,
            allowNull : false
        },
        type : {
            type : Sequelize.ENUM,
            values : _.pluck(PropertyType.enums, "key"),
            allowNull : false
        },
        description : {
            type : Sequelize.STRING,
            allowNull : true
        }
    });

    Role = sequelize.define("role", {
        name : {
            type : Sequelize.STRING,
            allowNull : false
        }
    });

    Instance = sequelize.define("instance", {
        ip : {
            type : Sequelize.STRING,
            allowNull : false
        },
        pollInterval : {
            type : Sequelize.INTEGER,
            allowNull : false,
            defaultValue : 60000
        },
        offline : {
            type : Sequelize.BOOLEAN,
            allowNull : false,
            defaultValue : false
        }
    });

    InstanceMetadata = sequelize.define("instance_metadata", {
        attributeKey : {
            type : Sequelize.STRING,
            allowNull : false
        },
        attributeValue : {
            type : Sequelize.STRING,
            allowNull : false
        }
    });

    Instance.belongsTo(Role, {as : "Role"});
    Instance.hasMany(InstanceMetadata, {as : "Metadata"});

    Role.hasMany(Property, {as : "Properties"});
    Role.hasMany(Instance, {as : "Instances"});
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
        createTables();
        done();
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
    Role.findOrCreate({ where: { name : roleName }}).spread(callback);
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
    role.addInstance(Instance.build({
        ip : ipAddress
    })).success(callback);
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
            return callback(null);
        }

        role.getInstances({ where : { ip : ipAddress }, order: "createdAt DESC", limit : 1}).success(function(instances) {
            var instance;

            // Do not create instances on GET requests when there is no instance (ip) associated
            // The only way to crate instances is with a POST
            if (_.isEmpty(instances) && !metadata) {
                return callback(null);
            }

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
                   include : [{model : Instance, where : {"offline" : false}, as : "Instances"}] }).success(function(roles) {

        // Sort instances by the created time
        _.map(roles, function(role) {
            role.dataValues.Instances = _.sortBy(role.dataValues.Instances, "createdAt");
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
                value : _.pluck(role.Instances, "ip").join(",").replace(/'"/g, "")
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

function propertyDoesNotExist(role, property) {
    return {msg : "Property '" + property + "' does not exist for '" + role + "'"};
}

// Expose sequelize object
PersistenceServiceMysql.prototype.getSequelize = function() {
    return sequelize;
};

/* @Override */
PersistenceServiceMysql.prototype.getRoles = function(callback) {
    // Sequelize does not support counting associated tables in a subquery -- using raw query
    sequelize.query("SELECT role.name, COUNT(*) AS instances FROM roles AS role, instances AS instances " +
                    "WHERE role.id = instances.roleId AND role.name != ? AND offline = false GROUP BY role.name ORDER BY name ASC",
                    null, {raw : true}, [Globals.GLOBAL_ROLE]).success(function(roles) {
                        callback(roles);
                    });
};

/* @Override */
PersistenceServiceMysql.prototype.getInstancesForRole = function(roleName, query, callback) {
    findRoleByName(roleName, function(role) {
        if (!role) {
            return callback([]);
        }

        role.getInstances({ where : {offline : false}, order : "attributeKey ASC",
                            include : [{model : InstanceMetadata, as : "Metadata"}] }).success(function(instances) {
            callback(DataUtils.filterInstancesByMetadata( DataUtils.getInstanceDto(roleName, DataUtils.toJSON(instances)), query));
        });
    });
};

/* @Override */
PersistenceServiceMysql.prototype.getInstances = function(query, callback) {
    Instance.findAll({ where : {offline : false},
                            include : [{model : InstanceMetadata, as : "Metadata"},
                                       {model: Role, as : "Role"}] }).success(function(instances) {
        callback(DataUtils.filterInstancesByMetadata( DataUtils.getInstanceDto(null, DataUtils.toJSON(instances)), query));
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
        if (properties && properties.length) {
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
                prop.destroy()
                    .success(function() {
                        logger.info("Deleted property.", {property : propertyName, role: roleName});
                        callback(null, DataUtils.toJSON(prop));
                    })
                    .fail(function(err) {
                        logger.error(err);
                        callback({msg : err}, {});
                    });
            } else {
                callback(propertyDoesNotExist(roleName, propertyName), {});
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
                var newProp = Property.build({
                    name : property.name,
                    type : PropertyType.get(property.type).key,
                    value : property.value,
                    description : property.description
                });

                role.addProperty(newProp).success(function(property) {
                    logger.info("Created property.", {property: property.dataValues}, {role: roleName});
                    callback(null, DataUtils.toJSON(property));
                });

            });
        }
    });
};

/* @Override */
PersistenceServiceMysql.prototype.updateProperty = function(roleName, property, callback) {
    getPropertiesForRole(roleName, {where : {"name" : property.name}}, function(role, properties) {
        var prop;
        if (properties && properties.length) {
            prop = properties[0];
            prop.updateAttributes({value : property.value, description : property.description})
                .success(function(updatedProperty) {
                    logger.info("Updated property.", {property: property, role: roleName});
                    callback(null, DataUtils.toJSON(updatedProperty));
                })
                .fail(function(err) {
                    logger.error(err);
                    callback({msg : err}, {});
                });
        } else {
            callback(propertyDoesNotExist(roleName, property.name), {});
        }
    });
};

/* @Override */
PersistenceServiceMysql.prototype.createProperties = function(roleName, properties, callback) {
    findOrCreateRole(roleName, function() {
        sequelize.transaction().then(function(t) {
            getGlobalProperties({transaction : t},function(globalProperties) {
                getPropertiesForRole(roleName, {transaction : t}, function(role, existingProps) {
                    properties = DataUtils.getNewProperties(globalProperties.concat(existingProps), properties);

                    // Add the role id to each property
                    _.each(properties, function(property) {
                        property.roleId = role.dataValues.id;
                    });

                    Property.bulkCreate(properties, {transaction: t}).success(function(props) {
                        logger.info("Created properties for role.", {role : role.dataValues.name, properties:properties});
                        t.commit().success(function() {
                            callback(DataUtils.toJSON(props));
                        });
                    }).error(function(err) {
                        logger.error(err);
                        t.rollback();
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
        
        sequelize.transaction().then(function(t) {
            // Bumps the UpdatedAt column
            instance.updateAttributes(updateObj, {transaction: t}).success(function(instance) {
                if (instance.options.isNewRecord && metadata) {
                    InstanceMetadata.bulkCreate(DataUtils.convertMetadata(metadata, instance), {transaction: t}).success(function() {
                        t.commit().success(function() {
                            logger.info("Created metadata for instance.", {instance: ipAddress, metadata: metadata});
                            callback(instance);
                        });
                    });
                } else {
                    t.commit().success(function() {
                        logger.debug("Instance checking in.", {instance : ipAddress, role: roleName});
                        callback(instance);                        
                    });
                }
            }).error(function(err) {
                t.rollback().success(function() {
                    logger.error(err);
                });
            });
        });
    });
};

/* @Override */
PersistenceServiceMysql.prototype.markInstancesOffline = function() {
    logger.debug("Checking for instances that have not checked in recently.");
    
    sequelize.transaction().then(function(t) {

        Instance.findAll({ where : {offline : false}}, {transaction : t })
            .success(function(instances) {
                var ids = [];

                logger.debug("Found %s online instances.", instances.length);
                
                instances = _.filter(instances, function(instance) {
                    var timeSinceUpdate = new Date() - instance.dataValues.updatedAt;
                    return timeSinceUpdate > instance.dataValues.pollInterval * 2;
                });

                ids = _.pluck(_.pluck(instances, "dataValues"), "id");

                if (instances && instances.length > 0) {
                    Instance.update({offline : true}, {where : {id : ids}, transaction : t}).success(function() {
                        t.commit();
                    }).error(function(err) {
                        logger.error(err);
                        t.rollback();
                    });
                } else  {
                    t.commit();
                }
            })
            .error(function(err) {
                logger.error("Failed to mark instances offline. " + err);
            });

    });
};

/* @Override */
PersistenceServiceMysql.prototype.globalizeProperty = function(role, propertyName, callback) {
    logger.info("Making property global.", {property: propertyName});
    
    this.getProperty(role, propertyName, function(originalProperty) {
        if (_.isEmpty(originalProperty)) {
            callback({msg : "Failed to lookup property '" + propertyName + "'. Incorrect role?"});
            return;
        }

        Property.destroy({where : {"name" : propertyName}})
            .success(function() {
                var newProp = Property.build({
                    name : originalProperty.name,
                    type : PropertyType.get(originalProperty.type).key,
                    value : originalProperty.value
                });

                findOrCreateRole(Globals.GLOBAL_ROLE, function(role) {
                    role.addProperty(newProp).success(callback);
                });
            });
    });
};

module.exports = PersistenceServiceMysql;
module.exports.getSequelize = function() {
    return sequelize;
};
