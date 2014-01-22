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

define(["jquery", "underscore", "backbone", "bootstrap", "../broadcast", "bootstrap-switch",
        "../models/property",
        "hbars!templates/propertyEditor.template",
        "hbars!templates/propertyTypes.template"],
function($, _, Backbone, Bootstrap, Broadcast, bsswitcher, Property, editorTemplate, propertyTypes) {
    
    return Backbone.View.extend({
        el : "#modal",

        events : {
            "click .add-property-confirm" : "addProperty",
            "keyup input,textarea" : "modelChange",
            "change input,select"  : "modelChange",
            "click .type-selector" : "typeChange",
            "click .cancel" : "close"
        },

        initialize: function() {
            this.property = new Property();
        },

        render: function(role, property) {
            // This is view is for a particular property, which means we need to edit it
            this.editing = property;

            this.role = role;
            this.$el.html(editorTemplate({edit : this.editing})).modal("show");
            this.$("#types").html(propertyTypes());
            
            this.property.clear();
            this.property.set({name : property, role : role});
            if (this.editing) {
                this.property.id = property;
                this.property.idAttribute = "name";
                this.property.fetch({success : _.bind(this.propertyFetchCallback, this) });
            }
        },

        propertyFetchCallback: function(property) {
            // name
            this.$("input[name='name']").val(property.escape("name")).attr("disabled", true);

            // type
            this.$(".type-selector").addClass("disabled");
            this.$(".property-type[name='type'][value='"+property.escape("type")+"']").parent(".type-selector")
                .removeClass("disabled")
                .addClass("active");

            this.$(".type-selector > input[name='type'][value='"+property.escape("type")+"']").click();

            // value
            this.$(":input[name='value']").val(property.getExpandedInput());
        },

        modelChange: function(event) {
            var target = $(event.currentTarget);
            this.property.set(target.attr("name"), target.val());
            this.checkModelValidity();
        },

        checkModelValidity: function() {
            this.$(".add-property-confirm").toggleClass("disabled", !this.property.isValid());
        },

        addCallback: function() {
            this.$el.modal("hide");
            this.trigger("property:add", this.role);
            this.close();
        },

        typeChange: function(event) {
            var target = $(event.currentTarget).find("input");
            this.$(".property-type").hide();
            this.$(".property-type[data-type='"+target.val()+"']").show().change().keyup();
            this.checkModelValidity();
        },

        addProperty: function() {
            this.property.save({}, { success : _.bind(this.addCallback, this) });
            this.property.idAttribute = "id";
        },

        close: function() {
            if (this.edit) {
                Broadcast.trigger("route:previous");
            }
            this.$el.empty();
        }
    });

});