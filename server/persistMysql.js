/***************************************************************************
 * COPYRIGHT (C) 2014, Rapid7 LLC, Boston, MA, USA.
 * All rights reserved. This material contains unpublished, copyrighted
 * work including confidential and proprietary information of Rapid7.
 **************************************************************************/

var config = require("./config/settings"),
    mysqlConfig = config.getPersistConfig(),
    Sequelize = require("sequelize"),
    propertyType = require("./propertyType"),
    mysql = require("mysql"),
    _ = require("lodash"),
    trycatch = require("trycatch"),
    sequelize,
    GLOBAL_ROLE = "global",

    // Tables
    Property,
    Role,
    Instance,
    InstanceMetadata;

function connect() {
    trycatch(function() {
        var connection = mysql.createConnection(mysqlConfig);
        connection.query("CREATE DATABASE IF NOT EXISTS "+mysqlConfig.databaseName+";");
        connection.end();

        sequelize = new Sequelize(mysqlConfig.databaseName, mysqlConfig.user, mysqlConfig.password, {
            host : mysqlConfig.host,
            port : mysqlConfig.port,
            dialect : "mysql",
            omitNull: true
        });
    }, function() {
        console.log("Failed to connect to database. Make sure SQL is running and you have the appropriate permissions.");
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
        pollingInterval : {
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

    Instance.hasMany(InstanceMetadata);

    Role.hasMany(Property, {as : "Properties"});
    Role.hasMany(Instance, {as : "Instances"});
    //Instance.belongsTo(Role);

    //InstanceMetadata.belongsTo(Instance);

    sequelize.sync();
}

// Constructor
var PersistMysql = function() {
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
function getGlobalProperties(callback) {
    findOrCreateRole(GLOBAL_ROLE, function(role) {
        role.getProperties().success(callback);
    });
}

function toJSON(rows) {
    return _.isArray(rows) ? _.pluck(rows, "dataValues") : rows.dataValues;
}

// Get global properites overlayed with role properties
function getCombinedProperties(globalProperties, roleProperties) {
    var properties = roleProperties;

    _.each(globalProperties, function(globalProp) {
        var result = _.filter(properties, function(property){
            return property.dataValues.name === globalProp.dataValues.name;
        });

        // Add the global global property
        if (result.length === 0) {
            properties.push(globalProp);
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

function getPropertiesForRole(role, callback) {
    findRoleByName(role, function(role) {
        if (role) {
            role.getProperties().success(function(properties) {
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

// Todo : make this not suck
function findOrCreateInstance(roleName, ipAddress, metadata, callback) {
    findRoleByName(roleName, function(role) {
        role.getInstances({ where : { ip : ipAddress }}).success(function(instances) {
            var instance;

            if (_.isEmpty(instances)) {
                createInstanceForRole(role, ipAddress, callback);
                
            } else {
                instance = instances[0];
                // Check to see if metadata is the same, if it is, service is online
                // and return that instance, otherwise, we need a new instance because
                // it's metadata (version?) has changed
                instance.getInstanceMetadata().success(function(metadatas) {
                    
                    // Same -- metadata null is a hack for polling GETs
                    if (isMetadataSame(metadatas, metadata)) {
                        instance.updateAttributes({ offline : false }).success(callback);
                    
                    // The instance should be offline, create a new one
                    } else {
                        createInstanceForRole(role, ipAddress, callback);
                    }
                });
            }
        });
    });
}

PersistMysql.prototype.getRoles = function(callback) {
    Role.findAll({ where : ["name != ?", GLOBAL_ROLE], include : [{model : Instance, as : "Instances"}] }).success(function(roles) {

        // Only return instances that are online
        _.map(roles, function(role) {
            role.dataValues.instances = _.filter(role.dataValues.instances, function(instance) {
                return instance.offline === false;
            });
        });
        callback(toJSON(roles));
    });
};

PersistMysql.prototype.getPropertiesForWeb = function(roleName, callback) {
    getPropertiesForRole(roleName, function(role, properties) {
        callback(getPropertiesDto(role || roleName, toJSON(properties)));
    });
};

PersistMysql.prototype.getPropertiesForClient = function(roleName, callback) {
    getGlobalProperties(function(globalProperties) {
        getPropertiesForRole(roleName, function(role, properties) {
            if (role) {
                callback(getPropertiesDto(role, toJSON(getCombinedProperties(globalProperties, properties))));
            } else {
                callback(getPropertiesDto(roleName, []));
            }
        });
    });
};

PersistMysql.prototype.deleteProperty = function(roleName, propertyName, callback) {
    findRoleByName(roleName, function(role) {
        role.getProperties({ where : { name : propertyName }}).success(function(properties) {
            if (properties && properties.length > 0) {
                var prop = properties[0];
                prop.destroy().success(function() {
                    callback(toJSON(prop));
                });
            }
        });
    });
};

PersistMysql.prototype.createProperty = function(roleName, property, callback) {
    findOrCreateRole(roleName, function(role) {
        Property.create({
            name : property.name,
            type : propertyType.get(property.type).key,
            value : property.value
        }).success(function(property) {
            role.addProperty(property).success(function(property) {
                callback(toJSON(property));
            });
        });
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
        getPropertiesForRole(roleName, function(role, existingProps) {
            properties = getNewProperties(existingProps, properties);

            // Add the role id to each property
            _.each(properties, function(property) {
                property.roleId = role.dataValues.id;
            });

            Property.bulkCreate(properties).success(function(props) {
                callback(toJSON(props));
            });
        });
    });
};

// Todo check if role exists
PersistMysql.prototype.instanceCheckIn = function(roleName, ipAddress, metadata, callback) {
    findOrCreateInstance(roleName, ipAddress, metadata, function(instance) {
        instance.updateAttributes({
            ip : ipAddress
        }).success(function(instance) {
            InstanceMetadata.create({
                attributeKey : "foo",
                attributeValue : "bar"
            }).success(function(metadata) {
                instance.setInstanceMetadata([metadata]).success(function() {
                    callback(instance);
                });
            });
        });
    });
};

PersistMysql.prototype.markInstancesOffline = function() {
    Instance.findAll({ where : {offline : false} }).success(function(instances) {
        instances = _.filter(instances, function(instance) {
            var timeSinceUpdate = new Date() - instance.dataValues.updatedAt;
            console.log(timeSinceUpdate);
            return timeSinceUpdate > instance.dataValues.pollingInterval * 2;
        });

        _.each(instances, function(instance) {
            instance.updateAttributes({
                offline : true
            });
        });
    });
};

module.exports = PersistMysql;
