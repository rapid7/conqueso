var assert = require("assert"),
	utils = require("../server/utils");

describe("utils", function() {
    describe("#propertiesToTextPlain", function(){
        it("should return empty string for null properties", function() {
            assert.equal("", utils.propertiesToTextPlain(null));
        });
    });

    describe("#propertiesToTextPlain", function(){
        it("should return empty string for empty properties", function() {
            assert.equal("", utils.propertiesToTextPlain([]));
        });
    });

    describe("#propertiesToTextPlain", function(){
        it("should return plain text of single property", function() {
        	var result = utils.propertiesToTextPlain([{
        		name  : "foo",
        		value : "bar"
        	}]);
            assert.equal("foo=bar\n", result);
        });
    });

    describe("#propertiesToTextPlain", function(){
        it("should return plain text of multiple properties", function() {
        	var result = utils.propertiesToTextPlain([
        	{ name : "foo", value : "bar" },
        	{ name : "a", value : "b"}]);
            assert.equal("foo=bar\na=b\n", result);
        });
    });
});