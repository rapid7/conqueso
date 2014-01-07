/***************************************************************************
 * COPYRIGHT (C) 2014, Rapid7 LLC, Boston, MA, USA.
 * All rights reserved. This material contains unpublished, copyrighted
 * work including confidential and proprietary information of Rapid7.
 **************************************************************************/

var express = require("express"),
    settings = require("./config/settings"),
    app = express(),
    
    // todo: remove
    PersistMysql = require("./persistMysql"),
    persist = new PersistMysql(),
    
    port = settings.getHttpPort();

require("./routes")(express, app, persist);

app.listen(port);
console.log("Listening on port: " + port);