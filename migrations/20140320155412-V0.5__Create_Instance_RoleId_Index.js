module.exports = {
    up: function(migration, DataTypes, done) {
        migration.addIndex("instances", ["ip", "roleId"]);
        done();
    },

    down: function(migration, DataTypes, done) {
        migration.removeIndex("instances", ["ip", "roleId"]);
        done();
    }
}
