/*******************************************************************************
 * COPYRIGHT (C) 2013, Rapid7 LLC, Boston, MA, USA. All rights reserved. This
 * material contains unpublished, copyrighted work including confidential and
 * proprietary information of Rapid7.
 ******************************************************************************/

define(["backbone"], function(Backbone){
    return Backbone.Model.extend({
        urlRoot: "api/roles/"
    });
});