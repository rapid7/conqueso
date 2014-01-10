/***************************************************************************
 * COPYRIGHT (C) 2014, Rapid7 LLC, Boston, MA, USA.
 * All rights reserved. This material contains unpublished, copyrighted
 * work including confidential and proprietary information of Rapid7.
 **************************************************************************/

var Enum = require("enum");
module.exports = new Enum(["STRING", "BOOLEAN", "DOUBLE", "FLOAT", "INTEGER", "LONG", "LIST", "MAP"]);

// Todo, change to these: BOOLEAN, DOUBLE, FLOAT, INT, LONG, STRING, STRING_LIST, STRING_MAP, STRING_SET