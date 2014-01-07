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
    createProperty : function(role, property, callback) {

    },

    /* Update and existing property
     * role     string
     * name     string  name of property
     * value    string
     */
    updateProperty : function(role, name, value) {

    },

    /* Bulk update/create properties
     * role         string
     * properties   list        list of property objects
     */
    updateProperties : function(role, properties) {

    },

    /* Delete a property
     * role     string
     * name     string
     */
    deleteProperty : function(role, name, callback) {

    },

    /* Get all properties for a role
     * role     string
     */
    getProperties : function(role, callback) {

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