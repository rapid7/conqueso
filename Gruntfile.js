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

    module.exports = function(grunt) {
        "use strict";

        var jsFiles   = ["*.js", "client/js/**/*.js", "*.json", "server/**/*.js"],
            htmlFiles = ["client/**/*.template", "client/*.html"],
            cssFiles  = ["client/css/*.scss"];

        grunt.initConfig({

            jshint: {
                options: {
                    eqeqeq:    true,
                    undef:     true,
                    latedef:   true,
                    immed:     true,
                    browser:   true,
                    indent:    4,
                    maxdepth:  3,
                    curly:     true,
                    camelcase: true,
                    newcap:    true,
                    noempty:   true,
                    unused:    true,
                    trailing:  true,
                    multistr:  true,
                    quotmark:  "double",
                    maxcomplexity: 10,
                    maxstatements: 20,
                    maxlen:        135,
                    globals : {
                        "define"  : false,
                        "require" : false,
                        "console" : false,
                        "module"  : false,
                        "__dirname" : false
                    }
                },
                files: jsFiles
            },

            csslint: {
                strict: {
                    options: {
                        "ids": false,
                        "box-sizing": false,
                        "important": false,
                        "adjoining-classes": false,
                        "fallback-colors": false,
                        "gradients": false,
                        "box-model": false,
                        "outline-none": false,
                        "regex-selectors": false,
                        "unqualified-attributes": false,
                        "font-sizes": false
                    },
                    src: cssFiles
                }
            },

            htmlhint: {
                options: {
                    "tag-self-close": true,
                    "tagname-lowercase": true,
                    "attr-lowercase": true,
                    "attr-value-double-quotes": true,
                    "tag-pair": true,
                    "id-unique": true
                },
                src: htmlFiles
            },

            sass: {
                dist : {
                    options: {
                        includePaths: require("node-bourbon").includePaths,
                        outputStyle: "compressed"
                    },
                    files: {
                        "client/css/main.css" : "client/css/main.scss"
                    }
                }
            },

            watch: {
                scripts : {
                    files : jsFiles,
                    tasks : ["jshint"]
                },
                css : {
                    files : cssFiles,
                    tasks : ["sass:dist"]
                },
                html : {
                    files : htmlFiles,
                    tasks : ["htmlhint"]
                }
            },

            exec : {
                bower : {
                    cwd : "client",
                    cmd : "bower install"
                }
            }
        });

        /* Depedencies */
        grunt.loadNpmTasks("grunt-exec");
        grunt.loadNpmTasks("grunt-contrib-jshint");
        grunt.loadNpmTasks("grunt-contrib-watch");
        grunt.loadNpmTasks("grunt-htmlhint");
        grunt.loadNpmTasks("grunt-sass");

        /* Tasks */
        grunt.registerTask("default", ["exec:bower", "jshint", "sass:dist", "htmlhint"]);
    };
})();
