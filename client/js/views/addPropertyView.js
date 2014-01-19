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

define(["jquery", "underscore", "backbone", "bootstrap",
        "../models/property",
        "hbars!templates/add.template"],
function($, _, Backbone, Bootstrap, Property, addTemplate) {
    
    return Backbone.View.extend({
        el : "#modal",

        events : {
            "click .add-property-confirm" : "addProperty",
            "change input,select" : "modelChange"
        },

        render: function(role) {
            this.role = role;
            this.$el.html(addTemplate()).modal("show");
            this.property = new Property({role : role});
        },

        modelChange: function(event) {
            var target = $(event.currentTarget);
            this.property.set(target.attr("name"), target.val());
        },

        addCallback: function() {
            this.$el.modal("hide");
            this.trigger("property:add", this.role);
        },

        addProperty: function() {
            this.property.save({}, { success : _.bind(this.addCallback, this) });
        }
    });

});