/***************************************************************************
 * COPYRIGHT (C) 2013, Rapid7 LLC, Boston, MA, USA.
 * All rights reserved. This material contains unpublished, copyrighted
 * work including confidential and proprietary information of Rapid7.
 **************************************************************************/

/*global window */
define(["backbone", "../views/propertiesView"], function(Backbone, PropertiesView){

    return Backbone.Router.extend({

        routes:{
            "roles/:name"           : "roleRoute",
            "properties/:property"  : "propertyRoute"
        },

        initialize: function() {
            Backbone.history.start({root: window.location.pathname});
        },

        roleRoute: function(name) {
            this.propertiesView = new PropertiesView();
            this.propertiesView.render(name);
        },

        propertyRoute: function(property) {
            console.log("property: " + property);
        }
    });
});
