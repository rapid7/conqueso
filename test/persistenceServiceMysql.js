var assert = require("assert"),
    SqlService = require("../server/db/persistenceServiceMysql"),
    persistMysql;

before(function(done) {
    persistMysql = new SqlService({
        dialect: "sqlite",
        host : "testDb",
        port : ""
    }, done);
});

describe("persistMysql", function() {
    describe("#getRoles", function(){
        it("This should return 0 roles", function(done) {
            var myRoles = [];

            persistMysql.getRoles(function(roles) {
                myRoles = roles;
                done();
            });

            assert.equal(0, myRoles.length);
        });
    });
});