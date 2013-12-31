/***************************************************************************
 * COPYRIGHT (C) 2013, Rapid7 LLC, Boston, MA, USA.
 * All rights reserved. This material contains unpublished, copyrighted
 * work including confidential and proprietary information of Rapid7.
 **************************************************************************/

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
            if (this.totalRoutes > 1) {
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
