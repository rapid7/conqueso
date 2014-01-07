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
    _ = require("lodash");

/* jshint unused:false, latedef:false*/
module.exports = function() {
    var connection = mysql.createConnection(mysqlConfig);
    connection.query("CREATE DATABASE IF NOT EXISTS "+mysqlConfig.databaseName+";");
    connection.end();

    var sequelize = new Sequelize(mysqlConfig.databaseName, mysqlConfig.user, mysqlConfig.password, {
        host : mysqlConfig.host,
        port : mysqlConfig.port,
        dialect : "mysql"
    });

    var Property = sequelize.define("property", {
        key : Sequelize.TEXT,
        value : Sequelize.TEXT,
        type : {
            type : Sequelize.ENUM,
            values : _.pluck(propertyType.enums, "key")
        }
    });

    var Role = sequelize.define("role", {
        name : Sequelize.TEXT
    });

    var Instance = sequelize.define("instance", {
        ip : Sequelize.STRING,
        metadata : Sequelize.TEXT
    });

    Role.hasMany(Property, {as : "Properties"});
    Role.hasMany(Instance, {as : "Instances"});

    sequelize.sync();

    /*sequelize.sync().success(function() {
        
        // Make some dummy data
        Role.create({
            name : "hey it worked"
        }).success(function(role) {
            Property.create({
                key : "this is my key",
                value : "this is my value",
                type : propertyType.STRING.key
            }).success(function(property) {
                role.addProperty(property).success(function() {
                    
                    Role.find({ where : {name : "hey it worked"} }).success(function(role) {
                        console.log("found the role!");

                        role.getProperties().success(function(properties) {
                            _.each(properties, function(prop) {
                                console.log("Key: " + prop.dataValues.key + ", " + prop.dataValues.value);
                            });
                        });
                    });

                });
            });
        });
    });*/

    

};