/***************************************************************************
 * COPYRIGHT (C) 2013, Rapid7 LLC, Boston, MA, USA.
 * All rights reserved. This material contains unpublished, copyrighted
 * work including confidential and proprietary information of Rapid7.
 **************************************************************************/

define(["jquery", "underscore", "backbone", "bootstrap", "../broadcast",
        "hbars!templates/settings.template"],
function($, _, Backbone, Bootstrap, Broadcast, settingsTemplate) {
    
    return Backbone.View.extend({
        el : "#modal",

        events : {
            "click .save" : "save",
            "click .option" : "optionSelected"
        },

        render: function() {
            this.$el.html(settingsTemplate()).modal("show");
        },

        optionSelected: function() {
            Broadcast.trigger("route:previous");
        },

        save: function() {
            this.$el.modal("hide");
        }
    });

});