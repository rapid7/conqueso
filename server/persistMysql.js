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
    sequelize,
    GLOBAL_ROLE = "global",

    // Tables
    Property,
    Role,
    Instance;

function connect() {
    var connection = mysql.createConnection(mysqlConfig);
    connection.query("CREATE DATABASE IF NOT EXISTS "+mysqlConfig.databaseName+";");
    connection.end();

    sequelize = new Sequelize(mysqlConfig.databaseName, mysqlConfig.user, mysqlConfig.password, {
        host : mysqlConfig.host,
        port : mysqlConfig.port,
        dialect : "mysql"
    });
}

function createTables() {
    Property = sequelize.define("property", {
        key : Sequelize.TEXT,
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
        ip : Sequelize.STRING,
        metadata : Sequelize.TEXT
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

function createOrGetRole(roleName, callback) {
    findRoleByName(roleName, function(role) {
        if (!role) {
            Role.create({
                name : roleName
            }).success(function(role) {
                callback(role);
            });
        } else {
            callback(role);
        }
    });
}

// Returns a callback with a list of property models
function getGlobalProperties(callback) {
    createOrGetRole(GLOBAL_ROLE, function(role) {
        role.getProperties().success(function(properties) {
            callback(properties);
        });
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
            return property.dataValues.key === globalProp.dataValues.key;
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
        name : roleModel.dataValues.name,
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

PersistMysql.prototype.getRoles = function(callback) {
    Role.findAll({ where : ["name != ?", GLOBAL_ROLE], include : [{model : Instance, as : "Instances"}] }).success(function(roles) {
        callback(toJSON(roles));
    });
};

PersistMysql.prototype.getPropertiesForWeb = function(roleName, callback) {
    getPropertiesForRole(roleName, function(role, properties) {
        callback(getPropertiesDto(role, toJSON(properties)));
    });
};

PersistMysql.prototype.getPropertiesForClient = function(roleName, callback) {
    getGlobalProperties(function(globalProperties) {
        getPropertiesForRole(roleName, function(role, properties) {
            callback(getPropertiesDto(role, toJSON(getCombinedProperties(globalProperties, properties))));
        });
    });
};

PersistMysql.prototype.deleteProperty = function(roleName, propertyName, callback) {
    findRoleByName(roleName, function(role) {
        role.getProperties({ where : { key : propertyName }}).success(function(properties) {
            if (properties && properties.length > 0) {
                var prop = properties[0];
                prop.destroy().success(function() {
                    callback(toJSON(prop));
                });
            }
        });
    });
};

PersistMysql.prototype.createProperty = function(roleName, name, type, value, callback) {
    createOrGetRole(roleName, function(role) {
        Property.create({
            key : name,
            type : propertyType.get(type).key,
            value : value
        }).success(function(property) {
            role.addProperty(property).success(function(property) {
                callback(toJSON(property));
            });
        });
    });
};

PersistMysql.prototype.createProperties = function(roleName, properties, callback) {
    createOrGetRole(roleName, function(role) {
        Property.bulkCreate(properties).success(function(resultingProperties) {
            console.log(resultingProperties);
            role.addProperty(resultingProperties).success(function(resultingProperties) {
                callback(toJSON(resultingProperties));
            });
        });
    });
};

module.exports = PersistMysql;
