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

var express = require("express"),
    app = express(),
    cluster = require("cluster"),
    config = require("./config/settings"),
    logger = require("./logger"),
    port = config.getHttpPort();

if (cluster.isMaster) {
    logger.info("Starting Conqueso server");
}

if (!config.isClusteringEnabled()) {
    process.env.isMaster = true;
}

if (config.isClusteringEnabled() && cluster.isMaster) {
    var cpus = require("os").cpus().length,
        workers = config.getClusterCount() || cpus;

    logger.info("Clustering enabled.", {CPUs:cpus, workers:workers});

    for (var i = 0; i < workers; i++) {
        var envData = (i === 0) ? {isMaster : true} : {};
        cluster.fork(envData);
    }

    cluster.on("online", function(worker) {
        logger.info( "Worker online", {pid: worker.process.pid});
    });

    // Re-fork when worker dies
    cluster.on("exit", function () {
        cluster.fork();
    });
} else {
    var PersistenceService = require("./db/persistenceService"),
        persistenceService = new PersistenceService(function() {
            // Load server default properties and roles if defaults.json file specified
            require("./propertyLoader")(persistenceService);

            app.listen(port, function() {
                if (process.env.isMaster) {
                    logger.info("Listening on port %d", port);
                }
                
                if (process.env.NODE_ENV === "production" && process.setuid && process.setgid) {
                    process.setgid("conqueso");
                    process.setuid("conqueso");
                }
            });
        });

    require("./routes/web")(express, app);
    require("./routes/api")(express, app, persistenceService);
    require("./serviceTracker")(persistenceService);
}