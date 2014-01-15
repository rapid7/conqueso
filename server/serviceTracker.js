/***************************************************************************
 * COPYRIGHT (C) 2014, Rapid7 LLC, Boston, MA, USA.
 * All rights reserved. This material contains unpublished, copyrighted
 * work including confidential and proprietary information of Rapid7.
 **************************************************************************/

module.exports = function(persistence) {
	var config = require("./config/settings"),
		interval = config.getPropertiesPollInterval() * 1000;

	setInterval(function() {
		persistence.markInstancesOffline(interval);
	}, interval);
};