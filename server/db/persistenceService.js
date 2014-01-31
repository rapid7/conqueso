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
 * Loads appropriate persistence implementation based on server settings
 * 
 * @module PersistenceService
 **/

var settings = require("../config/settings"),
	persistence;

switch (settings.getPersistType().toLowerCase()) {
	case "mysql":
		persistence = require("./persistenceServiceMysql");
		break;
	default:
		throw new Error("Unrecognized persistence type");
}

module.exports = new persistence(settings.getDbConfig(), Function);