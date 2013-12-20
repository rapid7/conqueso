/***************************************************************************
 * COPYRIGHT (C) 2013, Rapid7 LLC, Boston, MA, USA.
 * All rights reserved. This material contains unpublished, copyrighted
 * work including confidential and proprietary information of Rapid7.
 **************************************************************************/

define(["jquery", "underscore", "backbone", "handlebars", "../collections/roles",
        "hbars!templates/roles/list.template"],
function($, _, Backbone, Handlebars, RolesCollection, listTemplate) {
    
    return Backbone.View.extend({
        el : "#role-list",

        initialize: function() {
            this.roles = new RolesCollection();
            this.roles.fetch({sucess: _.bind(this.fetchCallback, this)});
        },
        
        fetchCallback: function(collection) {
            console.log("Collection loaded:")
            console.log(collection.toJSON());
        },

        render: function() {
            console.log("loading roles...");
            this.$el.html(listTemplate());
        }
    });

});

