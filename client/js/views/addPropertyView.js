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

define(["jquery", "underscore", "backbone", "bootstrap", "bootstrap-switch",
        "../models/property",
        "hbars!templates/add.template",
        "hbars!templates/propertyTypes.template"],
function($, _, Backbone, Bootstrap, bsswitcher, Property, addTemplate, propertyTypes) {
    
    return Backbone.View.extend({
        el : "#modal",

        events : {
            "click .add-property-confirm" : "addProperty",
            "keyup input" : "modelChange",
            "change input,select" : "modelChange",
            "click .type-selector" : "typeChange"
        },

        render: function(role) {
            this.role = role;
            this.$el.html(addTemplate()).modal("show");
            this.$("#types").html(propertyTypes());
            //this.$("input[type='checkbox']").bootstrapSwitch();
            this.property = new Property({role : role});
        },

        modelChange: function(event) {
            console.log("here in model change");
            var target = $(event.currentTarget);
            console.log(target.val());
            this.property.set(target.attr("name"), target.val());
            console.log("model validity: " + this.property.isValid());
            this.checkModelValidity();
        },

        checkModelValidity: function() {
            this.$(".add-property-confirm").toggleClass("disabled", !this.property.isValid());
        },

        addCallback: function() {
            this.$el.modal("hide");
            this.trigger("property:add", this.role);
        },

        typeChange: function(event) {
            var target = $(event.currentTarget).find("input");
            this.$(".property-type").hide();
            this.$(".property-type[data-type='"+target.val()+"']").show().change().keyup();
            this.checkModelValidity();
        },

        addProperty: function() {
            this.property.save({}, { success : _.bind(this.addCallback, this) });
        }
    });

});