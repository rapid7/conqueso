/***************************************************************************
 * COPYRIGHT (C) 2014, Rapid7 LLC, Boston, MA, USA.
 * All rights reserved. This material contains unpublished, copyrighted
 * work including confidential and proprietary information of Rapid7.
 **************************************************************************/

define(["jquery", "underscore", "backbone", "bootstrap",
        "../models/property",
        "hbars!templates/add.template"],
function($, _, Backbone, Bootstrap, Property, addTemplate) {
    
    return Backbone.View.extend({
        el : "#modal",

        events : {
            "click .add-property-confirm" : "addProperty",
            "change input,select" : "modelChange"
        },

        render: function(role) {
            this.$el.html(addTemplate()).modal("show");
            this.property = new Property({role : role});
        },

        modelChange: function(event) {
            var target = $(event.currentTarget);
            this.property.set(target.attr("name"), target.val());
        },

        addCallback: function(model) {
            console.log("here");
            this.$el.modal("hide");
        },

        addProperty: function() {
            this.property.save({ success : _.bind(this.addCallback, this) });
        }
    });

});