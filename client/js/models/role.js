/***************************************************************************
 * COPYRIGHT (C) 2014, Rapid7 LLC, Boston, MA, USA.
 * All rights reserved. This material contains unpublished, copyrighted
 * work including confidential and proprietary information of Rapid7.
 **************************************************************************/

define(["backbone", "underscore"], function(Backbone){
    return Backbone.Model.extend({
        urlRoot: "api/roles/",

        getProperties : function(callback) {
            this.fetch({
                url : this.urlRoot + this.id + "/properties-web",
                success : callback
            });
        }
    });
});