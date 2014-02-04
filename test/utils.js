var assert = require("assert"),
	utils = require("../server/utils");

describe("utils", function() {
    describe("#propertiesToTextPlain", function(){
        it("should return empty string for null properties", function() {
            assert.equal("", utils.propertiesToTextPlain(null));
        });

        it("should return empty string for empty properties", function() {
            assert.equal("", utils.propertiesToTextPlain([]));
        });

        it("should return plain text of single property", function() {
            var result = utils.propertiesToTextPlain([{
                name  : "foo",
                value : "bar"
            }]);
            assert.equal("foo=bar", result);
        });

        it("should return plain text of multiple properties", function() {
            var result = utils.propertiesToTextPlain([
            { name : "foo", value : "bar" },
            { name : "a", value : "b"}]);
            assert.equal("foo=bar\na=b", result);
        });
    });

    describe("#filterProperties", function(){
        it("should filter down to only one property", function() {
            var properites = [{ "name" : "foo", "value" : "val1" },
                              { "name" : "bar", "value" : "val2" }],
                result = utils.filterProperties(properites, "foo");
            assert.equal(result.length, 1);
        });

        it("nonexistent name should filter to nothing", function() {
            var properites = [{ "name" : "foo", "value" : "val1" }],
                result = utils.filterProperties(properites, "bar");
            assert.equal(result.length, 0);
        });

        it("should return empty list", function() {
            var result = utils.filterProperties([], "bar");
            assert.equal(result.length, 0);
        });
    });
});