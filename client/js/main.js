/***************************************************************************
 * COPYRIGHT (C) 2013, Rapid7 LLC, Boston, MA, USA.
 * All rights reserved. This material contains unpublished, copyrighted
 * work including confidential and proprietary information of Rapid7.
 **************************************************************************/
(function() {
    var VENDOR_LIB = "../bower_components/";

    require.config({
        //baseUrl: "",

        paths: {
            "jquery"       : VENDOR_LIB + "jquery/jquery.min",
            "bootstrap"    : VENDOR_LIB + "bootstrap/dist/js/bootstrap.min",
            "handlebars"   : VENDOR_LIB + "handlebars/handlebars.min",
            "text"         : VENDOR_LIB + "requirejs-text/text",
            "hbars"        : VENDOR_LIB + "requirejs-handlebars/hb",
            "backbone"     : VENDOR_LIB + "backbone/backbone-min",
            "underscore"   : VENDOR_LIB + "lodash/dist/lodash.underscore.min"
        },

        hbars: {
            extension: ".template",
            compileOptions: {}
        },

        shim: {
            bootstrap: ["jquery"],
            "backbone" : {
                deps : ["underscore", "jquery"],
                exports: "Backbone"
            },
            "handlebars" : {
                exports : "Handlebars"
            }
        }
    });
}());

require(["jquery", "backbone", "routers/router", "views/rolesListView",], function($, Backbone, Router, RolesListView) {
    $().ready(function(){
        console.log("Starting up");

        // Start rooooting!
        this.router = new Router();

        // Load roles
        this.rolesListView = new RolesListView();
        this.rolesListView.render();
    });
});