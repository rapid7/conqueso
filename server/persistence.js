/***************************************************************************
 * COPYRIGHT (C) 2014, Rapid7 LLC, Boston, MA, USA.
 * All rights reserved. This material contains unpublished, copyrighted
 * work including confidential and proprietary information of Rapid7.
 **************************************************************************/

// Interface for persistence
/* jshint unused:false */
module.exports = {

    /* Create a new property
     * role     string
     * property object      {name, value, type}
     */
    createProperty : function(role, name, value, type, callback) {

    },

    /* Bulk update/create properties
     * role         string
     * properties   list        list of property objects
     */
    createProperties : function(role, properties, callback) {

    },

    /* Delete a property
     * role     string
     * name     string
     */
    deleteProperty : function(role, name, callback) {

    },

    /* Get all properties for a role
     * includeGlobal true/false
     * role     string
     * returns json
     */
    getPropertiesForWeb : function(role, callback) {

    },

    /* Get all properties for a role and overlay global properties
     * includeGlobal true/false
     * role     string
     * returns text/plain
     */
    getPropertiesForClient : function(role, callback) {

    },

    /* Gets a property for a role by name
     * role     string
     * name     string
     */
    getProperty : function(role, name, callback) {

    },

    /* Return a list of roles
     */
    getRoles : function(callback) {

    }

};