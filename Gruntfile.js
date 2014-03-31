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

        var jsFiles   = ["*.js", "client/js/**/*.js", "server/**/*.js"],
            cssFiles  = ["client/css/*.scss"];

        grunt.initConfig({
   
            pkg: grunt.file.readJSON("package.json"),
            jshint: {
                options : {
                    jshintrc : true
                },
                files: jsFiles
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

            mochaTest: {
                test: {
                    options: {
                        reporter: "nyan"
                    },
                    src: ["test/**/*.js"]
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
                }
            },

            exec : {
                bower : {
                    cwd : "client",
                    cmd : function() {
                        return "bower install" + (process.env.USER === "root" ? " --allow-root" : "");
                    }
                },
                "npm-prod" : {
                    cmd : "npm install --production"
                }
            },
            
            compress: {
                main: {
                    options: {
                        archive: "artifact/conqueso-server-<%= pkg.version %>.zip"
                    },
                    files: [
                        {src: ["node_modules/**", "server/**", "client/**",
                               "package.json", "migrations/**", "templates/**" ], dest: "/"}
                    ]
                }
            },

            clean: {
                artifact : ["artifact", "templates"],
                npm : ["node_modules"]
            }
        });

        /* Depedencies */
        require("load-grunt-tasks")(grunt);

        /* Tasks */
        grunt.registerTask("test", ["mochaTest"]);
        grunt.registerTask("lint", ["jshint", "sass:dist"]);
        grunt.registerTask("default", ["exec:bower", "lint", "test"]);

        // Task to create sha256 checksum file
        grunt.registerTask("checksum", function() {
            var fs = require("fs");
            var crypto = require("crypto");
            var sha256 = crypto.createHash("sha256");
            var file = grunt.template.process("artifact/conqueso-server-<%= pkg.version %>.zip");
            var buffer = fs.readFileSync(file);
            sha256.update(buffer);
            var hash = sha256.digest("hex");
            grunt.log.writeln("sha256: " + hash);

            var sha256File = "artifact/sha256sum.txt";
            grunt.file.write(sha256File, hash);
            grunt.log.write("File " + sha256File + " created.").verbose.write("...").ok();
        });

        grunt.registerTask("templategen", function() {
            var settings = grunt.file.readJSON("server/config/settings.json");
            settings.http.port = "<%= node['conqueso']['http']['port'] %>";
            settings.http.enableClustering = "<%= node['conqueso']['http']['enableClustering'] %>";
            settings.http.clusterCountOverride = "<%= node['conqueso']['http']['clusterCountOverride'] %>";
            settings.db.type = "<%= node['conqueso']['db']['type'] %>";
            settings.db.config.host = "<%= node['conqueso']['db']['host'] %>";
            settings.db.config.port = "<%= node['conqueso']['db']['port'] %>";
            settings.db.config.databaseName = "<%= node['conqueso']['db']['databaseName'] %>";
            settings.db.config.user = "<%= node['conqueso']['db']['user'] %>";
            settings.db.config.password = "<%= node['conqueso']['db']['password'] %>";
            settings.db.config.pool.maxConnections = "<%= node['conqueso']['db']['maxConnections'] %>";
            settings.db.config.pool.maxIdleTime = "<%= node['conqueso']['db']['maxIdleTime'] %>";
            settings.properties.pollIntervalSecs = "<%= node['conqueso']['pollintervalsecs'] %>";
            settings.logging.file = "<%= node['conqueso']['logging']['file'] %>";
            settings.logging.dir = "<%= node['conqueso']['logging']['dir'] %>";
            settings.logging.level = "<%= node['conqueso']['logging']['level'] %>";
            grunt.file.write("templates/settings.json.erb", JSON.stringify(settings, null, 4));
        });
        grunt.registerTask("package", ["clean:artifact", "default", "templategen",
                                       "clean:npm", "exec:npm-prod", "compress", "checksum"]);
    };
})();
