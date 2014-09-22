define(function(require) {
    var Handlebars = require("hbs/handlebars"),
        moment = require("moment");

    function formatDate(date) {
        return moment(date).format("M/D/YY hh:mm:ss A");
    }

    Handlebars.registerHelper("formatDate", formatDate);

    return formatDate;
});