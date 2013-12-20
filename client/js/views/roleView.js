/***************************************************************************
 * COPYRIGHT (C) 2013, Rapid7 LLC, Boston, MA, USA.
 * All rights reserved. This material contains unpublished, copyrighted
 * work including confidential and proprietary information of Rapid7.
 **************************************************************************/

define(["jquery", "backbone", "../models/role",
        "hbars!templates/roles/main.template"],
function($, Backbone, RoleModel, mainTemplate) {
    
    var RoleView;

    RoleView = Backbone.View.extend({
        el : "#main-content",

        initialize: function(role) {
            this.role = new RoleModel({id : role});
        },
        
        render: function() {
            console.log("loading role...");
            console.log(this.role.toJSON());
            this.$el.html(mainTemplate(this.role.toJSON()));
        }
    });

    return RoleView;
});