module.exports = {
    up: function(migration, DataTypes, done) {
        var sequelize = migration.migrator.sequelize;
        var database = sequelize.config.database;

        sequelize.query("ALTER DATABASE " + database + " CHARACTER SET utf8 COLLATE utf8_general_ci")
	    .success(function() {
        	sequelize.query("ALTER TABLE instance_metadata CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci")
                    .success(function() {
                        sequelize.query("ALTER TABLE instances CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci")
                            .success(function() {
                                sequelize.query("ALTER TABLE properties CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci")
                                    .success(function() {
                                        sequelize.query("ALTER TABLE roles CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci")
                                            .success(function() { 
                                                done(); 
                                            });
                                    });
                            });
                    });
            });
    },
    down: function(migration, DataTypes, done) {
        var sequelize = migration.migrator.sequelize;
        var database = sequelize.config.database;

        sequelize.query("ALTER DATABASE " + database + " CHARACTER SET latin1 COLLATE latin1_swedish_ci")
            .success(function() {
                sequelize.query("ALTER TABLE instance_metadata CONVERT TO CHARACTER SET latin1 COLLATE latin1_swedish_ci")
                    .success(function() {
                        sequelize.query("ALTER TABLE instances CONVERT TO CHARACTER SET latin1 COLLATE latin1_swedish_ci")
                            .success(function() {
                                sequelize.query("ALTER TABLE properties CONVERT TO CHARACTER SET latin1 COLLATE latin1_swedish_ci")
                                    .success(function() {
                                        sequelize.query("ALTER TABLE roles CONVERT TO CHARACTER SET latin1 COLLATE latin1_swedish_ci")
                                            .success(function() { 
                                                done(); 
                                            });
                                    });
                            });
                    });
            });
  }
}
