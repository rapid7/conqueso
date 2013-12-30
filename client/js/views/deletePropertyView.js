/***************************************************************************
 * COPYRIGHT (C) 2013, Rapid7 LLC, Boston, MA, USA.
 * All rights reserved. This material contains unpublished, copyrighted
 * work including confidential and proprietary information of Rapid7.
 **************************************************************************/

define(["jquery", "underscore", "backbone", "bootstrap",
        "hbars!templates/roles/delete.template"],
function($, _, Backbone, Bootstrap, deleteTemplate) {
    
    return Backbone.View.extend({
        el : "#modal",

        events : {
            "click .yes-delete" : "confirmDelete"
        },

        render: function() {
            this.$el.html(deleteTemplate()).modal("show");
        },

        confirmDelete: function() {
            console.log("Remove property here");
            this.$el.modal("hide");
        },

    });

});

