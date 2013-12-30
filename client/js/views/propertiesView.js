/***************************************************************************
 * COPYRIGHT (C) 2013, Rapid7 LLC, Boston, MA, USA.
 * All rights reserved. This material contains unpublished, copyrighted
 * work including confidential and proprietary information of Rapid7.
 **************************************************************************/

define(["jquery", "backbone", "underscore", "../models/role",
        "./deletePropertyView",
        "hbars!templates/roles/properties.template"],
function($, Backbone, _, RoleModel, DeletePropertyView, mainTemplate) {
    
    return Backbone.View.extend({
        el : "#main-content",

        events : {
            "mouseover .list-group-item" : "mouseOverPropertyRow",
            "mouseout  .list-group-item" : "mouseOutPropertyRow",
            "click .remove"              : "removeProperty"
        },

        fetchCallback: function(model) {
            this.$el.html(mainTemplate(model.toJSON()));
        },

        render: function(role) {
            this.role = new RoleModel({id : role});
            this.role.getProperties(_.bind(this.fetchCallback, this));
        },

        toggleRemove: function(event, showHide) {
            $(event.currentTarget).find(".remove").toggle(showHide);
        },

        mouseOutPropertyRow: function(event) {
            this.toggleRemove(event, false);
        },

        mouseOverPropertyRow: function(event) {
            this.toggleRemove(event, true);
        },

        removeProperty: function() {
            this.removeView = new DeletePropertyView();
            this.removeView.render();
        }
    });

});