/***************************************************************************
 * COPYRIGHT (C) 2013, Rapid7 LLC, Boston, MA, USA.
 * All rights reserved. This material contains unpublished, copyrighted
 * work including confidential and proprietary information of Rapid7.
 **************************************************************************/

define(["jquery", "underscore", "backbone", "../collections/roles",
        "hbars!templates/roles/list.template"],
function($, _, Backbone, RolesCollection, listTemplate) {
    
    return Backbone.View.extend({
        el : "#role-list",

        events : {
            "click .list-group-item > a" : "roleClick"
        },

        fetchCallback: function(collection) {
            this.$el.html(listTemplate(collection.toJSON()));
        },

        render: function() {
            this.roles = new RolesCollection();
            this.roles.fetch({success: _.bind(this.fetchCallback, this)});
            this.$el.html(listTemplate());
        },

        roleClick: function(event) {
            this.$(".list-group-item").removeClass("active");
            $(event.currentTarget).parent(".list-group-item").addClass("active");
        }
    });

});

