var express = require("express"),
    app = express(),
    port = 8080;

app.use("/", express.static(__dirname + "/../client"));

app.listen(port);
console.log("Listening on port: " + port);