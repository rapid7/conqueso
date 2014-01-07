/***************************************************************************
 * COPYRIGHT (C) 2014, Rapid7 LLC, Boston, MA, USA.
 * All rights reserved. This material contains unpublished, copyrighted
 * work including confidential and proprietary information of Rapid7.
 **************************************************************************/

define(["jquery", "underscore", "backbone", "bootstrap",
        "../models/property", 
        "hbars!templates/delete.template"],
function($, _, Backbone, Bootstrap, Property, deleteTemplate) {
    
    return Backbone.View.extend({
        el : "#modal",

        events : {
            "click .yes-delete" : "confirmDelete"
        },

        render: function(role, propertyName) {
            this.$el.html(deleteTemplate()).modal("show");
            this.property = new Property({
                id : propertyName,
                key : propertyName,
                role : role
            });
        },

        deleteSuccess: function(model) {
            console.log("delete successful");
            this.$el.modal("hide");
            console.log(model.toJSON());
        },

        confirmDelete: function() {
            console.log("here");
            this.property.destroy({
                success : _.bind(this.deleteSuccess, this)
            })
        }
    });

});