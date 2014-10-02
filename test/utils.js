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

/* globals describe, it */

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