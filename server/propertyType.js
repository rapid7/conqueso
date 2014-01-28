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

/**
 * Available supported property types. Currently this is not shared with the client. 
 * If more types are added, make sure to add to the appropriate type and editor to the
 * client.
 * 
 * @module propertyType
 **/
var Enum = require("enum");
module.exports = new Enum(["STRING", "BOOLEAN", "DOUBLE", "FLOAT", "INT", "LONG", "STRING_LIST", "STRING_MAP", "STRING_SET"]);