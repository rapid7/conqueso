/***************************************************************************
 * COPYRIGHT (C) 2013, Rapid7 LLC, Boston, MA, USA.
 * All rights reserved. This material contains unpublished, copyrighted
 * work including confidential and proprietary information of Rapid7.
 **************************************************************************/

define(["jquery", "underscore", "backbone", "bootstrap", "../broadcast",
        "hbars!templates/edit.template"],
function($, _, Backbone, Bootstrap, Broadcast, editTemplate) {
    
    return Backbone.View.extend({
        el : "#modal",

        events : {
            "click .option" : "optionSelected",
            "click .save" : "save"
        },

        optionSelected: function() {
            Broadcast.trigger("route:previous");
        },

        render: function() {
            this.$el.html(editTemplate()).modal("show");
        },

        save: function() {
            this.$el.modal("hide");
        }
    });
});