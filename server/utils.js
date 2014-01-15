/***************************************************************************
 * COPYRIGHT (C) 2014, Rapid7 LLC, Boston, MA, USA.
 * All rights reserved. This material contains unpublished, copyrighted
 * work including confidential and proprietary information of Rapid7.
 **************************************************************************/
var _ = require("lodash");

module.exports = {
    // Takes a list of property objects and outputs text/plain properties
    propertiesToTextPlain : function(properties) {
        var result = "";
        _.each(properties, function(property) {
            result += property.name + "=" + property.value + "\n";
        });
        return result;
    }
};