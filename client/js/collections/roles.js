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

define(function(require) {
    var Backbone = require("backbone"),
        _ = require("underscore"),
        RoleModel = require("../models/role"),
        Broadcast = require("../broadcast");

    return Backbone.Collection.extend({
        model: RoleModel,
        url:   "api/roles/",
        comparator : function(model) {
            return model.get("name") === "global" ? model : model.get("name");
        },

        initialize : function() {
            this.on("change:instances", this.instanceChange, this);
        },

        instanceChange : function(model) {
            Broadcast.trigger("change:instances", model.get("name"));
        },

        unsetActive : function() {
            _.each(this.models, function(model) {
                model.unset("active");
            });
        }
    });
});