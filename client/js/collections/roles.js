/***************************************************************************
 * COPYRIGHT (C) 2014, Rapid7 LLC, Boston, MA, USA.
 * All rights reserved. This material contains unpublished, copyrighted
 * work including confidential and proprietary information of Rapid7.
 **************************************************************************/

define(["jquery", "backbone", "../models/role"], function($, Backbone, RoleModel) {
    return Backbone.Collection.extend({
        model: RoleModel,
        url:   "api/roles/"
    });
});