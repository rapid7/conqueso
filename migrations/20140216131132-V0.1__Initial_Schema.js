module.exports = {
    up: function(migration, DataTypes, done) {
        migration.createTable("roles",
            {
                id: {
                    type: DataTypes.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                createdAt: {
                    type: DataTypes.DATE,
                    allowNull: false
                },
                updatedAt: {
                    type: DataTypes.DATE,
                    allowNull: false
                },
                name: {
                    type: DataTypes.STRING
                }
            },
            {
                engine: "InnoDB",
                charset: "latin1"
            }
        );

        migration.createTable("properties",
            {
                id: {
                    type: DataTypes.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                createdAt: {
                    type: DataTypes.DATE,
                    allowNull: false
                },
                updatedAt: {
                    type: DataTypes.DATE,
                    allowNull: false
                },
                name: {
                    type: DataTypes.STRING
                },
                value : {
                    type: DataTypes.TEXT
                },
                type: {
                    type : DataTypes.ENUM,
                    values : ["STRING", "BOOLEAN", "DOUBLE", "FLOAT", "INT", "LONG", "STRING_LIST", "STRING_MAP", "STRING_SET"]
                },
                roleId: {
                    type: DataTypes.INTEGER
                }
            },
            {
                engine: "InnoDB",
                charset: "latin1"
            }
        );

        migration.createTable("instances",
            {
                id: {
                    type: DataTypes.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                createdAt: {
                    type: DataTypes.DATE,
                    allowNull: false
                },
                updatedAt: {
                    type: DataTypes.DATE,
                    allowNull: false
                },
                ip: {
                    type: DataTypes.STRING
                },
                offline : {
                    type: DataTypes.BOOLEAN,
                    allowNull : false,
                    defaultValue : false
                },
                pollInterval: {
                    type : DataTypes.INTEGER,
                    defaultValue: 60000
                },
                roleId: {
                    type: DataTypes.INTEGER
                }
            },
            {
                engine: "InnoDB",
                charset: "latin1"
            }
        );

        migration.createTable("instance_metadata",
            {
                id: {
                    type: DataTypes.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                createdAt: {
                    type: DataTypes.DATE,
                    allowNull: false
                },
                updatedAt: {
                    type: DataTypes.DATE,
                    allowNull: false
                },
                attributeKey: {
                    type: DataTypes.STRING
                },
                attributeValue: {
                    type : DataTypes.STRING
                },
                instanceId: {
                    type: DataTypes.INTEGER
                }
            },
            {
                engine: "InnoDB",
                charset: "latin1"
            }
        );

        done();
    },

    down: function(migration, DataTypes, done) {
        migration.dropAllTables().complete(done);
    }
}
