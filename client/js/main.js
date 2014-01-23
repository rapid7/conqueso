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
 
(function() {
    var VENDOR_LIB = "../bower_components/";

    require.config({

        paths: {
            "jquery"           : VENDOR_LIB + "jquery/jquery.min",
            "bootstrap"        : VENDOR_LIB + "bootstrap/dist/js/bootstrap.min",
            "handlebars"       : VENDOR_LIB + "handlebars/handlebars.min",
            "text"             : VENDOR_LIB + "requirejs-text/text",
            "hbars"            : VENDOR_LIB + "requirejs-handlebars/hb",
            "backbone"         : VENDOR_LIB + "backbone-amd/backbone-min",
            "underscore"       : VENDOR_LIB + "lodash/dist/lodash.underscore.min"
        },

        shim: {
            bootstrap : ["jquery"],
            handlebars : { exports : "Handlebars" }
        }
    });
}());

require(["jquery", "backbone", "routers/router", "views/rolesListView", "./helpers"],
         function($, Backbone, Router, RolesListView) {
    
    $(document).ready(function(){
        // Load roles
        this.rolesListView = new RolesListView();
        this.rolesListView.render();

        this.router = new Router();
    });
});