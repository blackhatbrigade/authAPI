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

  /**
   * Mongoose Interface for user data.
   */
  var userConn = new (require('../jnt_modules/mongoose/schemas/user'))(log);

  /*
   * App configuration.
   */
  var config = require('../config');

  /**
   * Starting up mongo connection.
   */
  var mongoConn = mongoose.createConnection(config.mongodb);
  mongoConn.on('connected', function() {
    log.info('Connected to MongoDB');

    mongoConn.on('close', function() {
      log('Connection to MongoDB closed');
    });
  });

  /**
   * Mongoose Model for Users Data
   */
  console.log(userConn);
  var Users = userConn.getUserModel(mongoConn);

  /**
   * Accessor function for retreiving mongoose instance.
   */
  function getDB() {
    //mongoose.mongoConnect('mongodb://localhost:27017/api');
    return mongoConn;
  }

  /**
   * Accessor function for retreiving app logger.
   */
  function getLogger() {
    return log;
  }

  /**
   * Accessor function for retreiving app config.
   */
  function getConfig() {
    return config;
  }

  /**
   * Accessor function for retreiving user manipulation object.
   */
  function getUsers() {
    return Users;
  }

  return {
    getUsers: getUsers,
    getLogger: getLogger,
    getDB: getDB,
    getConfig: getConfig
  };
}

module.exports = dependencies;
