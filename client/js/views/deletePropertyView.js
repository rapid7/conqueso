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
            "click .confirm-delete" : "confirmDelete"
        },

        render: function(role, propertyName) {
            this.roleName = role;
            this.$el.html(deleteTemplate()).modal("show");
            this.property = new Property({
                id : propertyName,
                key : propertyName,
                role : role
            });
        },

        deleteCallback: function() {
            this.$el.modal("hide");
            this.trigger("property:delete", this.roleName);
        },

        confirmDelete: function() {
            this.property.destroy({ success : _.bind(this.deleteCallback, this) });
        }
    });

});