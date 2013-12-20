var express = require("express"),
    app = express(),
    port = 8080;

require('./routes')(express, app);

app.listen(port);
console.log("Listening on port: " + port);