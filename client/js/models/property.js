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

function isFloat(n) {
    return n.match(/^\-?[0-9]*\.?[0-9]+$/);
}

function isInteger(n) {
    return n.match(/^\-?[0-9]+$/);
}

function isValidName(str) {
    return str.match(/^[\w\_\-\.]*$/g);
}

/* 
 * key=value,key=value
 */
function isValidMap(str) {
    return str.trim().match(/^([^\s,]+\=[^\s,]+,?)+$/g);
}

define(["jquery", "backbone", "underscore"], function($, Backbone, _){
    return Backbone.Model.extend({
        urlRoot: function() {
            return "api/roles/" + this.get("role") + "/properties";
        },

        initialize: function() {
            this.on("change:value", this.flattenInput, this);
        },

        flattenInput: function(model) {
            switch (model.get("type")) {
                case "STRING_LIST":
                case "STRING_SET":
                case "STRING_MAP":
                    model.set({"value" : model.get("value").replace(/\n/g, ",")}, {silent: true});
            }
        },

        getExpandedInput: function() {
            switch (this.get("type")) {
                case "STRING_LIST":
                case "STRING_SET":
                case "STRING_MAP":
                    return this.get("value").replace(/,/g, "\n");
                default:
                    return this.get("value");
            }
        },

        globalize: function(ajaxParams) {
            var defaults = {
                type: "POST",
                data: this.toJSON(),
                url: this.url()+"/globalize"
            };
            return $.ajax(_.extend(defaults, ajaxParams));
        },

        /* jshint maxcomplexity:false */
        validate: function(attributes) {
            var name        = attributes.name,
                type        = attributes.type,
                value       = attributes.value;

            if (!name || !isValidName(name)) {
                return "Must have a name";
            }

            if (!type) {
                return "Must select type";
            }

            if (_.isUndefined(value) || _.isEmpty(value)) {
                return "Must have a value";
            }

            switch (type) {
                case "STRING":
                case "BOOLEAN":
                    // Value just has to be not empty
                    break;
                case "DOUBLE":
                case "FLOAT":
                    if (!isFloat(value)) {
                        return "Invalid value";
                    }
                    break;
                case "LONG":
                case "INT":
                    if (!isInteger(value)) {
                        return "Invalid value";
                    }
                    break;
                case "STRING_LIST":
                case "STRING_SET":
                    // Value just has to be not empty
                    return;
                case "STRING_MAP":
                    if (!isValidMap(value)) {
                        return "Invalid map";
                    }
            }
        }
    });
});
