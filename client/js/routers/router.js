/***************************************************************************
 * COPYRIGHT (C) 2013, Rapid7 LLC, Boston, MA, USA.
 * All rights reserved. This material contains unpublished, copyrighted
 * work including confidential and proprietary information of Rapid7.
 **************************************************************************/

define(["backbone", "underscore", "Broadcast",
        "../views/propertiesView", "../views/editPropertyView"],
        function(Backbone, _, Broadcast, PropertiesView, EditPropertyView){

    return Backbone.Router.extend({
        history : [],

        routes : {
            "roles/:name"                       : "roleRoute",
            "roles/:name/properties/:property"  : "propertyRoute"
        },

        initialize: function() {
            //Broadcast.on("route:previous", this.bind(this.previous, this));
            this.bind("all", _.bind(this.storeRoute, this));

            Backbone.history.start();
        },

        storeRoute: function() {
            console.log("store route..");
            this.history.push(Backbone.history.fragment);
        },

        previous: function() {
            console.log("in previous");
            if (this.history.length > 1) {
                console.log("going back...");
                this.navigate(this.history[this.history.length - 2], {silent: true});
            } else {
                this.navigate("");
            }
        },

        roleRoute: function(name) {
            this.propertiesView = new PropertiesView();
            this.propertiesView.render(name);
        },

        propertyRoute: function(role, property) {
            console.log("Render property:" + property + ", for role:" + role);
            this.propertyView = new EditPropertyView();
            this.propertyView.render(property);
        }
    });
});
