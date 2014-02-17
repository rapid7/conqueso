module.exports = {
    up: function(migration, DataTypes, done) {
        // Add constraints on the property table
        migration.changeColumn("properties", "name", { type: DataTypes.STRING, allowNull: false });
        migration.changeColumn("properties", "value", { type: DataTypes.TEXT, allowNull: false });
        migration.changeColumn("properties", "type", { type: DataTypes.ENUM, 
            values: ["STRING", "BOOLEAN", "DOUBLE", "FLOAT", "INT", "LONG", "STRING_LIST", "STRING_MAP", "STRING_SET"], 
            allowNull: false });
        migration.changeColumn("properties", "roleId", { type: DataTypes.INTEGER, allowNull: false });
        migration.addIndex("properties", ["name", "roleId"], { indicesType: 'UNIQUE' });

        // Add constraints on the role table
        migration.changeColumn("roles", "name", { type: DataTypes.STRING, allowNull: false });
        migration.addIndex("roles", ["name"], { indiciesType: 'UNIQUE' });

        // Add constraints on the instance table
        migration.changeColumn("instances", "ip", { type: DataTypes.STRING, allowNull: false });
        migration.changeColumn("instances", "pollInterval", { type: DataTypes.INTEGER, defaultValue: 60000, allowNull: false });
        migration.changeColumn("instances", "roleId", { type: DataTypes.INTEGER, allowNull: false });

        // Add constraints on the instance_metadata table
        migration.changeColumn("instance_metadata", "attributeKey", { type: DataTypes.STRING, allowNull: false });
        migration.changeColumn("instance_metadata", "attributeValue", { type: DataTypes.STRING, allowNull: false });
        migration.changeColumn("instance_metadata", "instanceId", { type: DataTypes.INTEGER, allowNull: false });
        migration.addIndex("instance_metadata", ["attributeKey", "instanceId"], { indicesType: 'UNIQUE' });

        done() // sets the migration as finished
    },

    down: function(migration, DataTypes, done) {
        // Remove constraints on the property table
        migration.changeColumn("properties", "name", { type: DataTypes.STRING, allowNull: true });
        migration.changeColumn("properties", "value", { type: DataTypes.TEXT, allowNull: true });
        migration.changeColumn("properties", "type", { type: DataTypes.ENUM, 
            values: ["STRING", "BOOLEAN", "DOUBLE", "FLOAT", "INT", "LONG", "STRING_LIST", "STRING_MAP", "STRING_SET"], 
            allowNull: true });
        migration.changeColumn("properties", "roleId", { type: DataTypes.INTEGER, allowNull: true });
        migration.removeIndex("properties", ["name", "roleId"]);

        // Add constraints on the role table
        migration.changeColumn("roles", "name", { type: DataTypes.STRING, allowNull: true });
        migration.removeIndex("roles", ["name"]);

        // Add constraints on the instance table
        migration.changeColumn("instances", "ip", { type: DataTypes.STRING, allowNull: true });
        migration.changeColumn("instances", "pollInterval", { type: DataTypes.INTEGER, defaultValue: 60000, allowNull: true });
        migration.changeColumn("instances", "roleId", { type: DataTypes.INTEGER, allowNull: true });

        // Add constraints on the instance_metadata table
        migration.changeColumn("instance_metadata", "attributeKey", { type: DataTypes.STRING, allowNull: true });
        migration.changeColumn("instance_metadata", "attributeValue", { type: DataTypes.STRING, allowNull: true });
        migration.changeColumn("instance_metadata", "instanceId", { type: DataTypes.INTEGER, allowNull: true });
        migration.removeIndex("instance_metadata", ["attributeKey", "instanceId"]);

        done() // sets the migration as finished
    }
}
