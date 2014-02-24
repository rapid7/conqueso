module.exports = {
  up: function(migration, DataTypes, done) {
    migration.addColumn("properties", "description", { type: DataTypes.STRING, allowNull: true }).complete(done);
  },
  down: function(migration, DataTypes, done) {
    migration.removeColumn("properties", "description").complete(done);
  }
}
