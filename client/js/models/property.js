/***************************************************************************
 * COPYRIGHT (C) 2014, Rapid7 LLC, Boston, MA, USA.
 * All rights reserved. This material contains unpublished, copyrighted
 * work including confidential and proprietary information of Rapid7.
 **************************************************************************/

define(["backbone"], function(Backbone){
    return Backbone.Model.extend({
        urlRoot: function() {
            return "api/roles/" + this.get("role") + "/properties";
        }
    });
});