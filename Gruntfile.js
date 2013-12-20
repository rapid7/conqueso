(function(){
    /*global __dirname*/
    module.exports = function(grunt) {
        "use strict";

        var jsFiles   = ["*.js", "client/js/**/*.js", "*.json"],
            htmlFiles = ["client/**/*.template", "client/*.html"];

        grunt.initConfig({

            PATHS: {
                CLIENT: __dirname + "/client/",
            },

            pkg: grunt.file.readJSON("package.json"),

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
                    quotmark:  "double",
                    maxcomplexity: 8,
                    maxstatements: 29,
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
                    src: ["**/*.css"]
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
                    files : [],
                    tasks : ["csslint", "cssmin"]
                },
                html : {
                    files : htmlFiles,
                    tasks : ["htmlhint"]
                }
            },

            /*"bower-install": {

                target: {
                    // Point to the html file that should be updated
                    // when you run `grunt bower-install`
                    html: "client/index.html",

                    // ---------
                    // Optional:
                    // ---------

                    // If your file paths shouldn't contain a certain
                    // portion of a url, it can be excluded
                    //
                    //   default: ''
                    //ignorePath: 'app/',

                    // Customize how your stylesheets are included on
                    // your page.
                    //
                    //   default: '<link rel="stylesheet" href="{{filePath}}" />'
                    cssPattern: "<link href='{{filePath}}' rel='stylesheet'>",

                    // Customize how your <script>s are included into
                    // your HTML file.
                    //
                    //   default: '<script src="{{filePath}}"></script>'
                    jsPattern: "<script type='text/javascript' src='{{filePath}}'></script>",

                    directory : "client"
                }
            },*/

            bower: {
                /*install: {
                    //just run 'grunt bower:install' and you'll see files from your Bower packages in lib directory
                    options : {
                        install : true
                    }
                },*/
                target: {
                    rjsConfig: "client/js/config.js",
                    options: {
                        install : true
                    }
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
        //grunt.loadNpmTasks("grunt-bower-task");
        grunt.loadNpmTasks("grunt-exec");
        //grunt.loadNpmTasks("grunt-bower-install");
        grunt.loadNpmTasks("grunt-bower-requirejs");
        grunt.loadNpmTasks("grunt-contrib-clean");
        grunt.loadNpmTasks("grunt-contrib-jshint");
        grunt.loadNpmTasks("grunt-contrib-csslint");
        grunt.loadNpmTasks("grunt-contrib-watch");
        grunt.loadNpmTasks("grunt-htmlhint");

        grunt.registerTask("default", ["exec:bower", "jshint", "htmlhint"]);

        /* Tasks */
        /*grunt.registerTask("test",     ["jshint", "csslint", "htmlhint"]);
        grunt.registerTask("compile",  ["requirejs:compile"]);
        grunt.registerTask("notest",   ["clean", "compile"]);
        grunt.registerTask("default",  ["clean", "test", "compile"]);*/
    };
})();
