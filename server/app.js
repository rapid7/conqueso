/***************************************************************************
 * COPYRIGHT (C) 2013, Rapid7 LLC, Boston, MA, USA.
 * All rights reserved. This material contains unpublished, copyrighted
 * work including confidential and proprietary information of Rapid7.
 **************************************************************************/

var express = require("express"),
    app = express(),
    port = 8080;

require("./routes")(express, app);

app.listen(port);
console.log("Listening on port: " + port);