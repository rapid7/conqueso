/***************************************************************************
 * COPYRIGHT (C) 2014, Rapid7 LLC, Boston, MA, USA.
 * All rights reserved. This material contains unpublished, copyrighted
 * work including confidential and proprietary information of Rapid7.
 **************************************************************************/

define(["jquery", "backbone", "../models/property"], function($, Backbone, PropertyModel) {
    return Backbone.Collection.extend({
        model: PropertyModel,

        initialize: function(models, options) {
            options = options || {};
            if (options.name) {
                this.name = options.name;
            }
        },

        url: function() {
            return "api/roles/" + this.name + "/properties-ui";
        }
    });
});