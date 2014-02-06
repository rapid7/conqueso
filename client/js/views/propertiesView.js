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

define(["jquery", "backbone", "underscore", "../broadcast", "../models/role", "../collections/properties",
        "./deletePropertyView", "./propertyEditorView", "./makeGlobalView",
        "hbars!templates/properties.template"],
function($, Backbone, _, Broadcast, RoleModel, PropertiesCollection,
         DeletePropertyView, PropertyEditorView, MakeGlobalView, mainTemplate) {
    
    return Backbone.View.extend({
        el : "#main-content",

        initialize: function() {
            this.removeView = new DeletePropertyView();
            this.removeView.on("property:delete", _.bind(this.render, this));

            this.addView = new PropertyEditorView();
            this.addView.on("property:add", _.bind(this.render, this));

            this.makeGlobalView = new MakeGlobalView();
            this.makeGlobalView.on("property:globalize", _.bind(this.render, this));
        },

        events : {
            "mouseover .list-group-item" : "mouseOverPropertyRow",
            "mouseout  .list-group-item" : "mouseOutPropertyRow",
            "click .remove"              : "removeProperty",
            "click #add-property"        : "addProperty",
            "click .make-global"         : "makePropertyGlobal"
        },

        fetchCallback: function(model) {
            this.properties = new PropertiesCollection(model.properties, {name : model.get("name")});
            this.$el.html(mainTemplate(model.toJSON()));
            Broadcast.trigger("role:change", {name : model.get("name"), silent : true});
        },

        render: function(roleName) {
            this.roleName = roleName;
            this.role = new RoleModel({name : roleName});
            this.role.getProperties(_.bind(this.fetchCallback, this));
        },

        toggleRemove: function(event, showHide) {
            $(event.currentTarget).find(".controls").toggle(showHide);
        },

        mouseOutPropertyRow: function(event) {
            this.toggleRemove(event, false);
        },

        mouseOverPropertyRow: function(event) {
            this.toggleRemove(event, true);
        },

        getRole: function(event) {
            return this.$(event.currentTarget).closest(".property-item").data("role");
        },

        getPropertyName: function(event) {
            return this.$(event.currentTarget).closest(".property-item").data("name");
        },

        addProperty: function(event) {
            this.addView.render(this.getRole(event));
        },

        removeProperty: function(event) {
            this.removeView.render(this.getRole(event), this.getPropertyName(event));
        },

        makePropertyGlobal: function(event) {
            this.makeGlobalView.render(this.getRole(event), this.getPropertyName(event));
        }
    });
});