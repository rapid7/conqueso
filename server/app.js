/***************************************************************************
 * COPYRIGHT (C) 2013, Rapid7 LLC, Boston, MA, USA.
 * All rights reserved. This material contains unpublished, copyrighted
 * work including confidential and proprietary information of Rapid7.
 **************************************************************************/

var express = require("express"),
    settings = require("./config/settings"),
    app = express(),
    // remove
    //mysql = require("./persistMysql"),
    port = settings.getHttpPort();

require("./routes")(express, app);

// todo: remove -- just here for testing
//mysql();

app.listen(port);
console.log("Listening on port: " + port);