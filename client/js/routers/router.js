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

define(["backbone", "underscore", "../broadcast",
        "../views/propertiesView", "../views/editPropertyView",
        "../views/settingsView"],
        function(Backbone, _, Broadcast, PropertiesView, EditPropertyView, SettingsView) {

    return Backbone.Router.extend({
        totalRoutes : 0,

        routes : {
            "roles/:name"                       : "roleRoute",
            "roles/:name/properties/:property"  : "propertyRoute",
            "settings"                          : "settingsRoute"
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

        propertyRoute: function(role, property) {
            console.log("Render property:" + property + ", for role:" + role);
            if (!this.propertyView) {
                this.propertyView = new EditPropertyView();
            }
            this.propertyView.render(property);
        },

        settingsRoute: function() {
            if (!this.settingsView) {
                this.settingsView = new SettingsView();
            }
            this.settingsView.render();
        }
    });
});
