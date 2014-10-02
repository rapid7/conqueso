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

define(function(require) {
    var Backbone = require("backbone"),
        _ = require("underscore"),
        Broadcast = require("../broadcast"),
        PropertiesView = require("../views/propertiesView"),
        InstancesView = require("../views/instancesView"),
        PropertyEditorView = require("../views/propertyEditorView");

    return Backbone.Router.extend({
        totalRoutes : 0,

        routes : {
            "roles/:name"                      : "roleRoute",
            "roles/:name/properties"           : "rolePropertiesRoute",
            "roles/:name/instances"            : "roleInstancesRoute",
            "roles/:name/properties/:property" : "propertyRoute"
        },

        initialize: function() {
            Broadcast.on("route:previous", _.bind(this.previous, this));
            this.bind("all", _.bind(this.incRoute, this));
            Backbone.history.start();
        },

        incRoute: function() {
            this.totalRoutes++;
        },

        previous: function() {
            if (this.totalRoutes > 2) {
                window.history.back();
            } else {
                this.navigate("");
            }
        },

        roleRoute: function(name) {
            if (!this.propertiesView) {
                this.propertiesView = new PropertiesView();
            }
            this.propertiesView.render(name);
        },

        rolePropertiesRoute: function(name) {
            if (!this.propertiesView) {
                this.propertiesView = new PropertiesView();
            }
            this.propertiesView.render(name);
        },

        roleInstancesRoute: function(name) {
            if (!this.instancesView) {
                this.instancesView = new InstancesView();
            }
            this.instancesView.render(name);
        },

        propertyRoute: function(role, property) {
            if (!this.propertyView) {
                this.propertyView = new PropertyEditorView();
            }
            this.propertyView.render(role, property);
        }
    });
});
