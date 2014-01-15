/***************************************************************************
 * COPYRIGHT (C) 2014, Rapid7 LLC, Boston, MA, USA.
 * All rights reserved. This material contains unpublished, copyrighted
 * work including confidential and proprietary information of Rapid7.
 **************************************************************************/

define(["jquery", "underscore", "backbone", "../broadcast", "../models/role", "../collections/roles",
        "hbars!templates/roleList.template"],
function($, _, Backbone, Broadcast, Role, RolesCollection, listTemplate) {
    
    return Backbone.View.extend({
        el : "#role-list",

        FETCH_INTERVAL : 10000,

        globalRole : new Role({
            name : "GLOBAL PROPERTIES",
            url : "global",
            id : "global",
            instances : null,
            active : false
        }),

        initialize : function() {
            this.roles = new RolesCollection([this.globalRole]);
            Broadcast.on("role:change", _.bind(this.roleChange, this));
        },

        events : {
            "click .role-item" : "roleClick"
        },

        fetchCallback: function() {
            this.renderTemplate();
        },

        renderTemplate: function() {
            this.$el.html(listTemplate(this.roles.toJSON()));
        },

        fetchRolesPoller: function() {
            this.roles.fetch({update: true, merge: true, remove: false, success: _.bind(this.fetchCallback, this)});
        },

        render: function() {
            this.fetchRolesPoller();
            this.interval = setInterval(_.bind(this.fetchRolesPoller, this), this.FETCH_INTERVAL);
        },

        roleChange : function(event) {
            this.roleChangeByElement(this.$(".role-item[data-name='"+event.name+"'],"+
                                            ".role-item[data-id='"  +event.name+"']"));
        },

        roleChangeByElement : function(element) {
            if (!element || element && element.length === 0) {
                return;
            }

            this.roles.unsetActive();
            this.roles.get(element.data("id")).set("active", true);
            this.renderTemplate();

            window.location.href = element.find("a").attr("href");
        },

        roleClick: function(event) {
            this.roleChangeByElement($(event.currentTarget));
        }
    });
});
