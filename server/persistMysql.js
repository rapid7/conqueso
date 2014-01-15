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
    Instance;

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
        name : Sequelize.TEXT,
        value : Sequelize.TEXT,
        type : {
            type : Sequelize.ENUM,
            values : _.pluck(propertyType.enums, "key")
        }
    });

    Role = sequelize.define("role", {
        name : Sequelize.TEXT
    });

    Instance = sequelize.define("instance", {
        ip : Sequelize.STRING
    });

    Role.hasMany(Property, {as : "Properties"});
    Role.hasMany(Instance, {as : "Instances"});
    Instance.belongsTo(Role);

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

function findOrCreateInstance(roleName, ipAddress, callback) {
    findRoleByName(roleName, function(role) {
        role.getInstances({ where : { ip : ipAddress } }).success(function(instances) {
            if (_.isEmpty(instances)) {
                Instance.create({
                    ip : ipAddress
                }).success(function(instance) {
                    role.addInstance(instance).success(callback);
                });
            } else {
                callback(instances[0]);
            }
        });
    });
}

PersistMysql.prototype.getRoles = function(callback) {
    Role.findAll({ where : ["name != ?", GLOBAL_ROLE], include : [{model : Instance, as : "Instances"}] }).success(function(roles) {
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
PersistMysql.prototype.instanceCheckIn = function(roleName, ipAddress, callback) {
    findOrCreateInstance(roleName, ipAddress, function(instance) {
        instance.updateAttributes({
            ip : ipAddress
        }).success(function(instance) {
            callback(instance);
        });
    });
};

module.exports = PersistMysql;
