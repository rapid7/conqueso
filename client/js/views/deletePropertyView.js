/***************************************************************************
 * COPYRIGHT (C) 2014, Rapid7 LLC, Boston, MA, USA.
 * All rights reserved. This material contains unpublished, copyrighted
 * work including confidential and proprietary information of Rapid7.
 **************************************************************************/

define(["jquery", "underscore", "backbone", "bootstrap",
        "../broadcast",
        "hbars!templates/delete.template"],
function($, _, Backbone, Bootstrap, Broadcast, deleteTemplate) {
    
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
        }
    });

});