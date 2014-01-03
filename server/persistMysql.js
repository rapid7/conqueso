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

	connection.end();
};