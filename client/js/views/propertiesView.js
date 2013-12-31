/***************************************************************************
 * COPYRIGHT (C) 2013, Rapid7 LLC, Boston, MA, USA.
 * All rights reserved. This material contains unpublished, copyrighted
 * work including confidential and proprietary information of Rapid7.
 **************************************************************************/

define(["jquery", "backbone", "underscore", "../broadcast", "../models/role",
        "./deletePropertyView", "./addPropertyView",
        "hbars!templates/properties.template"],
function($, Backbone, _, Broadcast, RoleModel, DeletePropertyView, AddPropertyView, mainTemplate) {
    
    return Backbone.View.extend({
        el : "#main-content",

        initialize: function() {
            this.removeView = new DeletePropertyView();
            this.addView = new AddPropertyView();
        },

        events : {
            "mouseover .list-group-item" : "mouseOverPropertyRow",
            "mouseout  .list-group-item" : "mouseOutPropertyRow",
            "click .remove"              : "removeProperty",
            "click .add-property"        : "addProperty"
        },

        fetchCallback: function(model) {
            this.$el.html(mainTemplate(model.toJSON()));
            Broadcast.trigger("role:change", {name : model.get("role")});
        },

        render: function(role) {
            this.role = new RoleModel({id : role});
            this.role.getProperties(_.bind(this.fetchCallback, this));
        },

        toggleRemove: function(event, showHide) {
            $(event.currentTarget).find(".controls").toggle(showHide);
        },

        mouseOutPropertyRow: function(event) {
            this.toggleRemove(event, false);
        },

        mouseOverPropertyRow: function(event) {
            this.toggleRemove(event, true);
        },

        removeProperty: function() {
            this.removeView.render();
        },

        addProperty: function() {
            this.addView.render();
        }
    });

});