/***************************************************************************
 * COPYRIGHT (C) 2013, Rapid7 LLC, Boston, MA, USA.
 * All rights reserved. This material contains unpublished, copyrighted
 * work including confidential and proprietary information of Rapid7.
 **************************************************************************/

define(["jquery", "backbone", "underscore", "../models/role",
        "hbars!templates/roles/properties.template"],
function($, Backbone, _, RoleModel, mainTemplate) {
    
    return Backbone.View.extend({
        el : "#main-content",

        fetchCallback: function(model) {
            console.log(model.toJSON());
            this.$el.html(mainTemplate(model.toJSON()));
        },

        render: function(role) {
            this.role = new RoleModel({id : role});
            this.role.getProperties(_.bind(this.fetchCallback, this));
        }
    });

});