/***************************************************************************
 * COPYRIGHT (C) 2013, Rapid7 LLC, Boston, MA, USA.
 * All rights reserved. This material contains unpublished, copyrighted
 * work including confidential and proprietary information of Rapid7.
 **************************************************************************/

define(["jquery", "underscore", "backbone", "bootstrap",
        "hbars!templates/add.template"],
function($, _, Backbone, Bootstrap, addTemplate) {
    
    return Backbone.View.extend({
        el : "#modal",

        render: function() {
            this.$el.html(addTemplate()).modal("show");
        }
    });

});