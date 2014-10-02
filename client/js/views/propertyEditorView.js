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
    var _singleton,
        PropertyEditor,
        Backbone = require("backbone"),
        _ = require("underscore"),
        Broadcast = require("../broadcast"),
        Property = require("../models/property"),
        editorTemplate = require("hbs!templates/propertyEditor"),
        propertyTypes = require("hbs!templates/propertyTypes"),
        newPropertyTemplate = require("hbs!templates/newProperty"),
        editPropertyTemplate = require("hbs!templates/editProperty");

    require("bootstrap");

    PropertyEditor = Backbone.View.extend({
        el : "#modal",

        events : {
            "click .add-property-confirm" : "addProperty",
            "keyup input,textarea" : "modelChange",
            "change input,select"  : "modelChange",
            "click .type-selector" : "typeChange",
            "click .cancel" : "close"
        },

        render: function(role, propertyName) {
            // This is view is for a particular propertyName, which means we need to edit it
            this.editing = propertyName || false;

            this.role = role;
            this.$el.html(editorTemplate({edit : this.editing})).modal("show");
            
            if (this.editing) {
                this.property = new Property({id : propertyName, name : propertyName, role : role});
                this.property.idAttribute = "name";
                this.property.fetch({data : {json: true}, success : _.bind(this.propertyFetchCallback, this)});
            } else {
                this.$(".modal-body").html(newPropertyTemplate());
                this.$("#types").html(propertyTypes());
                this.property = new Property({role : role});
            }
        },

        propertyFetchCallback: function(property) {
            var elem;

            // Show appropriate input based on type
            this.$(".modal-body").html(editPropertyTemplate(property.toJSON()));
            elem = this.$(".property-type[data-type='" + property.get("type") + "']").show();

            // Boolean is a little bit different...
            if (property.get("type") === "BOOLEAN") {
                this.$(":input[name='value'][value='" + property.get("value") + "']").click();
            } else {
                elem.find(":input").val(property.getExpandedInput());
            }

            this.checkModelValidity();
        },

        modelChange: function(event) {
            var target = this.$(event.currentTarget);
            this.property.set(target.attr("name"), target.val());
            this.checkModelValidity();
        },

        checkModelValidity: function() {
            this.$(".add-property-confirm").toggleClass("disabled", !this.property.isValid());
        },

        addCallback: function() {
            this.$el.modal("hide");
            this.trigger("property:add", this.role);
        },

        errorCallback: function() {
            this.$(".alert").fadeOut().html("Property already exists. It may already be a global property.").fadeIn();
        },

        typeChange: function(event) {
            var target = this.$(event.currentTarget).find("input");
            this.$(".property-type").hide();
            this.$(".property-type[data-type='"+target.val()+"']").show().change().keyup()
                .find(":input").change().keyup();
            this.checkModelValidity();
        },

        addProperty: function() {
            this.property.save({}, {
                success : _.bind(this.addCallback, this),
                error : _.bind(this.errorCallback, this)
            });
            this.close();
        },

        close: function() {
            if (this.editing) {
                Broadcast.trigger("route:previous");
            }
        }
    });

    if (!_singleton) {
        _singleton = new PropertyEditor();
    }
    return function() {
        return _singleton;
    };
});
