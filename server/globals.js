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
 * Global values
 * 
 * @module Globals
 **/
module.exports = {
    /**
	 * Name used for the special "global" role
	 * 
	 * @property GLOBAL_ROLE
     * @type {String}
	 */
    GLOBAL_ROLE : "global",

    /**
	 * Append this prefix to all special properties, such as the role ip list
	 * 
	 * @property SPECIAL_PROPERTY_PREFIX
     * @type {String}
	 */
    SPECIAL_PROPERTY_PREFIX : "conqueso.",

    /**
	 * Metadata key which contains the Archaius polling interval setting. If 
	 * this is not present, we will default to Archaius' standard polling rate (60s)
	 * 
	 * @property POLL_INTEVERAL_META_KEY
     * @type {Number}
	 */
    POLL_INTEVERAL_META_KEY : "conqueso.poll.interval",

    /**
	 * Exit code used to notify Forever that we should just shutdown and not restart
	 * 
	 * @property FATAL_ERR_CODE
     * @type {Number}
	 */
    FATAL_ERR_CODE : 2
};