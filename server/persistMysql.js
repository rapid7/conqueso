/***************************************************************************
 * COPYRIGHT (C) 2014, Rapid7 LLC, Boston, MA, USA.
 * All rights reserved. This material contains unpublished, copyrighted
 * work including confidential and proprietary information of Rapid7.
 **************************************************************************/

var config = require("./config/settings"),
    mysqlConfig = config.getPersistConfig(),
    Sequelize = require("sequelize"),
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
        value : Sequelize.TEXT
    });

    var Role = sequelize.define("role", {
        name : Sequelize.TEXT
    });

    Role.hasMany(Property, {as : "Properties"});

    sequelize.sync().success(function() {
         // Make some dummy data
        /*var testProperty = Property.create({
            key : "this is my key",
            value : "this is my value"
        }).success(function() {
            var testRole = Role.create({
                name : "hey it worked"
            });

            testRole.setProperties([testProperty]).success(function() {
                testRole.save();
            });

        });*/


        var testRole = Role.build({
            name : "hey it worked"
        });

        var testProperty = Property.build({
            key : "this is my key",
            value : "this is my value"
        });

        testRole.setProperties([testProperty]);

        testProperty.save();
        testRole.save();
    });



    //sequelize.sync();

    /*connection.connect();

    connection.query("CREATE DATABASE IF NOT EXISTS "+mysqlConfig.databaseName+";");

    connection.changeUser({
        database : "configly"
    });

    connection.query("CREATE TABLE IF NOT EXISTS `property` ( \
      `id` INT(11) unsigned NOT NULL AUTO_INCREMENT, \
      `timestamp` bigint(20) NOT NULL, \
      `role` varchar(255) NOT NULL, \
      `key` varchar(255) NOT NULL, \
      `value` varchar(1024) NOT NULL, \
      PRIMARY KEY (`id`) \
    ) ENGINE=InnoDB DEFAULT CHARSET=latin1");

    connection.end();*/

    /*
    CREATE TABLE IF NOT EXISTS `role` (
      `id` varchar(255) unsigned NOT NULL AUTO_INCREMENT,
      `name` varchar(1024) NOT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=latin1


    CREATE TABLE IF NOT EXISTS `service` (
      `id` varchar(255) unsigned NOT NULL AUTO_INCREMENT,
      `role_id` varchar(255) NOT NULL
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=latin1
    */

    //connection.end();
};