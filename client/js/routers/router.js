/***************************************************************************
 * COPYRIGHT (C) 2013, Rapid7 LLC, Boston, MA, USA.
 * All rights reserved. This material contains unpublished, copyrighted
 * work including confidential and proprietary information of Rapid7.
 **************************************************************************/

/*global window */
define(["backbone", "../views/roleView"], function(Backbone, RoleView){

    return Backbone.Router.extend({

        routes:{
            "roles/:name" : "onRole"
        },

        initialize: function() {
            Backbone.history.start({root: window.location.pathname});
        },

        onRole: function(name) {
            this.roleView = new RoleView({id: name});
            this.roleView.render();
        }
    });
});
