/***************************************************************************
 * COPYRIGHT (C) 2013, Rapid7 LLC, Boston, MA, USA.
 * All rights reserved. This material contains unpublished, copyrighted
 * work including confidential and proprietary information of Rapid7.
 **************************************************************************/

(function() {

    module.exports = function(grunt) {
        "use strict";

        var jsFiles   = ["*.js", "client/js/**/*.js", "*.json", "server/**/*.js"],
            htmlFiles = ["client/**/*.template", "client/*.html"],
            cssFiles  = ["client/css/*.css"];

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
                    maxcomplexity: 5,
                    maxstatements: 20,
                    maxlen:        135,
                    globals : {
                        "define"  : false,
                        "require" : false,
                        "console" : false,
                        "module"  : false
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

            watch: {
                scripts : {
                    files : jsFiles,
                    tasks : ["jshint"]
                },
                css : {
                    files : cssFiles,
                    tasks : ["csslint"]
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
        grunt.loadNpmTasks("grunt-contrib-csslint");
        grunt.loadNpmTasks("grunt-contrib-watch");
        grunt.loadNpmTasks("grunt-htmlhint");

        /* Tasks */
        grunt.registerTask("default", ["exec:bower", "jshint", "csslint", "htmlhint"]);
    };
})();
