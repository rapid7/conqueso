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
    sequelize = null,

    // Tables
    Property,
    Role,
    Instance;

// Constructor
var PersistMysql = function() {
    var connection = mysql.createConnection(mysqlConfig);
    connection.query("CREATE DATABASE IF NOT EXISTS "+mysqlConfig.databaseName+";");
    connection.end();

    sequelize = new Sequelize(mysqlConfig.databaseName, mysqlConfig.user, mysqlConfig.password, {
        host : mysqlConfig.host,
        port : mysqlConfig.port,
        dialect : "mysql"
    });

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

    sequelize.sync();
};

function createRole(roleName) {
    Role.find({ where : { name : roleName.toLowerCase() }}).success(function(role) {
        if (!role) {
            console.log("role was not found");
        } else {
            console.log("role was found");
        }
    });
}

function findRoleByName(roleName, callback) {
    Role.find({ where : { name : roleName.toLowerCase() }}).success(callback);
}

function toJSON(rows) {
    return _.isArray(rows) ? _.pluck(rows, "dataValues") : rows.dataValues;
}

PersistMysql.prototype.getRoles = function(callback) {
    Role.findAll().success(function(roles) {
        return callback(toJSON(roles));
    });
};

PersistMysql.prototype.getProperties = function(role, callback) {
    findRoleByName(role, function(role) {
        if (role) {
            role.getProperties().success(function(properties) {
                callback(toJSON(properties));
            });
        } else {
            callback([]);
        }
    });
};

PersistMysql.prototype.deleteProperty = function(role, propertyName, callback) {
    findRoleByName(role, function(role) {
        role.getProperties({ where : { key : propertyName.toLowerCase() }, limit : 1 }).success(function(properties) {
            if (properties && properties.length > 0) {
                properties[0].destroy().success(function(property) {
                    console.log(property);
                    callback(toJSON(property));
                });
            }
        });
    });
};

PersistMysql.prototype.createProperty = function(roleName, name, type, value, callback) {
    findRoleByName(roleName, function(role) {

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

module.exports = PersistMysql;
