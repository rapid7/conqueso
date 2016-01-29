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
 * Provides console and file logging
 *
 * @module logger
 **/

var winston = require("winston"),
	fs = require("fs"),
	config = require("./config/settings"),
	loggingLevel = config.getLogLevel(),
	outputDir = config.getLogDirectory(),
	outputFile = config.getLogOutputFile(),
	_logger = null;

fs.exists(outputDir, function(exists) {
	if (!exists) {
		fs.mkdir(outputDir);
	}
});

var fileLoggingConfig = {
	level : loggingLevel,
	filename: outputDir + "/" + outputFile,
	json: false,
	handleExceptions: true
};

// To maintain backward compatibility users have to specify the new 'file'
// logging type in settings.js. The default settings include it, but if
// the user changes it or removes it, Conqueso will fall back to the
//  DailyRotateFile transport.
if (config.getLogType() === "file") {
	var fileTransport = new (winston.transports.File)(fileLoggingConfig);
} else {
	fileLoggingConfig.maxsize = 10485760;
	var fileTransport = new (winston.transports.DailyRotateFile)(fileLoggingConfig);
}

_logger = new (winston.Logger)({
	levels : {error: 3, warn: 2, info: 1, debug: 0},
	colors: winston.config.syslog.colors,
	transports: [
		new (winston.transports.Console)({
			level : loggingLevel,
			colorize: true,
			json: false,
			handleExceptions: true
		}),
		fileTransport
	]
});

module.exports = {
	logFile : outputDir + "/" + outputFile,
	debug  : _logger.debug,
	info   : _logger.info,
	warn   : _logger.warn,
	error  : _logger.error
};
