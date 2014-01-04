/***************************************************************************
 * COPYRIGHT (C) 2014, Rapid7 LLC, Boston, MA, USA.
 * All rights reserved. This material contains unpublished, copyrighted
 * work including confidential and proprietary information of Rapid7.
 **************************************************************************/

define(["jquery", "underscore", "backbone", "../broadcast", "../collections/roles",
        "hbars!templates/roleList.template"],
function($, _, Backbone, Broadcast, RolesCollection, listTemplate) {
    
    return Backbone.View.extend({
        el : "#role-list",

        initialize : function() {
            Broadcast.on("role:change", _.bind(this.roleChange, this));
        },

        events : {
            "click .role-item" : "roleClick"
        },

        fetchCallback: function(collection) {
            this.$el.html(listTemplate(collection.toJSON()));
        },

        render: function() {
            this.roles = new RolesCollection();
            this.roles.fetch({success: _.bind(this.fetchCallback, this)});
        },

        roleChange : function(event) {
            this.roleChangeByElement(this.$(".role-item[data-name='"+event.name+"']"));
        },

        roleChangeByElement : function(element) {
            if (!element || element && element.length === 0) {
                return;
            }

            this.$(".role-item").removeClass("active");
            element.addClass("active");
            window.location.href = element.find("a").attr("href");
        },

        roleClick: function(event) {
            this.roleChangeByElement($(event.currentTarget));
        }
    });

});

