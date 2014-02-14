/**
* COPYRIGHT (C) 2014, Rapid7 LLC, Boston, MA, USA.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

define(["jquery", "underscore", "backbone", "../broadcast", "../models/role", "../collections/roles",
        "hbars!templates/roleList.template"],
function($, _, Backbone, Broadcast, Role, RolesCollection, listTemplate) {
    
    return Backbone.View.extend({
        el : "#role-list",

        FETCH_INTERVAL : 10000,

        globalRole : new Role({
            display : "GLOBAL PROPERTIES",
            name : "global",
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
            this.roles.fetch({remove: false, success: _.bind(this.fetchCallback, this)});
        },

        render: function() {
            this.fetchRolesPoller();
            this.interval = setInterval(_.bind(this.fetchRolesPoller, this), this.FETCH_INTERVAL);
        },

        roleChange : function(event) {
            this.roleChangeByElement(this.$(".role-item[data-name='"+event.name+"']"), event.silent);
        },

        roleChangeByElement : function(element, silent) {
            if (!element || element && element.length === 0) {
                return;
            }

            this.roles.unsetActive();
            this.roles.get(element.data("name")).set("active", true);
            this.renderTemplate();

            if (!silent) {
                window.location.href = element.find("a").attr("href");
            }
        },

        roleClick: function(event) {
            this.roleChangeByElement($(event.currentTarget));
        }
    });
});
