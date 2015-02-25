/**
* COPYRIGHT (C) 2014, Rapid7 LLC, Boston, MA, USA.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
 
(function() {
    var VENDOR_LIB = "../bower_components/";

    require.config({
        paths: {
            "backbone"         : VENDOR_LIB + "backbone/backbone",
            "jquery"           : VENDOR_LIB + "jquery/dist/jquery.min",
            "bootstrap"        : VENDOR_LIB + "bootstrap/dist/js/bootstrap.min",
            "hbs"              : VENDOR_LIB + "require-handlebars-plugin/hbs",
            "underscore"       : VENDOR_LIB + "lodash/lodash.min",
            "moment"           : VENDOR_LIB + "moment/min/moment.min",

            "templates" : "../templates"
        },

        hbs: {
            templateExtension: "template",
        },

        shim: {
            bootstrap : ["jquery"]
        }
    });
}());

define(function(require) {
    var $ = require("jquery"),
        Router = require("routers/router"),
        RolesListView = require("views/rolesListView"),
        ServerInfo = require("models/serverInfo"),
        ServerInfoView = require("views/serverInfoView");

    $(function() {
        var self = this;

        // Load roles
        this.rolesListView = new RolesListView();
        this.rolesListView.render();

        // Show server info
        this.serverInfo = new ServerInfo();
        this.serverInfoView = new ServerInfoView({
            model : this.serverInfo
        });

        this.serverInfo.fetch().done(function(model) {
            $(".conqueso-version")
                .html("v" + model.version)
                .click(function() {
                    self.serverInfoView.render();
                });
        });

        this.router = new Router();
    });
});
