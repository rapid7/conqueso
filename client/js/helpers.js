require(function(require) {
    var Handlebars = require("hbs/handlebars"),
        moment = require("moment");

    Handlebars.registerHelper("compare", function(lvalue, rvalue, options) {
        var operator;

        if (arguments.length < 3) {
            throw new Error("Handlerbars Helper 'compare' needs 2 parameters");
        }

        operator = options.hash.operator || "==";

        var operators = {
            "===":      function(l,r) { return l === r; },
            "!==":      function(l,r) { return l !== r; },
            "<":        function(l,r) { return l < r; },
            ">":        function(l,r) { return l > r; },
            "<=":       function(l,r) { return l <= r; },
            ">=":       function(l,r) { return l >= r; },
            "typeof":   function(l,r) { return typeof l === r; }
        };

        if (!operators[operator]) {
            throw new Error("Handlerbars Helper 'compare' doesn't know the operator "+operator);
        }

        var result = operators[operator](lvalue,rvalue);

        if (result) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    });

    Handlebars.registerHelper("formatDate", function(date) {
        return moment(date).format("M/D/YY hh:mm:ss A");
    });
});