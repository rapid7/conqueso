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
		new (winston.transports.File)({
			level : loggingLevel,
			filename: outputDir + "/" + outputFile,
			json: false,
			handleExceptions: true
		})
	]
});

module.exports = {
	logFile : outputDir + "/" + outputFile,
	debug  : _logger.debug,
	info   : _logger.info,
	warn   : _logger.warn,
	error  : _logger.error
};
