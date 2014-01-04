/***************************************************************************
 * COPYRIGHT (C) 2014, Rapid7 LLC, Boston, MA, USA.
 * All rights reserved. This material contains unpublished, copyrighted
 * work including confidential and proprietary information of Rapid7.
 **************************************************************************/

var config = require("./config/settings"),
    mysqlConfig = config.getPersistConfig(),
    mysql = require("mysql"),

    connection = mysql.createConnection({
        host     : mysqlConfig.url,
        port     : mysqlConfig.port,
        user     : mysqlConfig.username,
        password : mysqlConfig.password
    });

module.exports = function() {
    connection.connect();

    connection.query("CREATE DATABASE IF NOT EXISTS "+mysqlConfig.databaseName+";");

    /*
    CREATE TABLE IF NOT EXISTS `property` (
      `id` varchar(255) unsigned NOT NULL AUTO_INCREMENT,
      `timestamp` bigint(20) NOT NULL,
      `role` varchar(255) NOT NULL,
      `key` varchar(255) NOT NULL,
      `value` varchar(1024) NOT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=latin1


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

    connection.end();
};