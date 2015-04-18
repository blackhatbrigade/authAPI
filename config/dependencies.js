/**
 * Logger module.
 */
var logger = require('bunyan');

/**
 * Handles dependencies for app.
 */
function dependencies() {
  /**
   * Main mongoose instance.
   */
  var mongoose = require('mongoose');

  /**
   * Main logger object.
   */
  var log = logger.createLogger({name: 'API'});

  /*
   * App configuration.
   */
  var config = require('../config');

  /**
   * Accessor function for retreiving mongoose instance.
   */
  function getDB() {
    return mongoose;
  }

  /**
   * Accessor function for retreiving app logger.
   */
  function getLogger() {
    return log;
  }

  function getConfig() {
    return config;
  }

  return {
    getLogger: getLogger,
    getDB: getDB,
    getConfig: getConfig
  };
}

module.exports = dependencies;
