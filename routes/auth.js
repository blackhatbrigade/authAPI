/**
 * Promise module.
 */
var q = require('q');

/**
 * Object that handles user authorization against DB.
 */
var auth = function (dependencies) {
  /**
   * App mongoose instance.
   */
  var conn = dependencies.getDB();

  /**
   * App Logger instance.
   */
  var logger = dependencies.getLogger();

  /**
   * User Helper Object.
   *
   * @property
   */
  var User = dependencies.getUsers();

  /**
   * App config data.
   *
   * @property
   */
  var config = dependencies.getConfig();

  /**
   * Magical encryption module?
   *
   * @property
   */
  var jwt = require('jwt-simple');

  /**
   * Allows for keeping track of authModule scope.
   *
   * @property
   */
  var self = this;

  /**
   * Generates a token and saves it to the user document in question.
   *
   * @method
   */
  function genToken(userObj) {
    var expires = expiresIn(7); // 7 days
    var token = jwt.encode({
      exp: expires
    }, require('../config/secret')());

    userObj.token = token;
    userObj.token_exp = expires;
    userObj.save(function(err) {
      if (err) {
        logger.error('Error creating user', err);
      }
    });

    return {
      token: token,
      expires: expires,
      user: userObj.username
    };
  }

  /**
   * Convienence function for setting expire date.
   *
   * @method
   */
  function expiresIn(numDays) {
    var dateObj = new Date();
    return dateObj.setDate(dateObj.getDate() + numDays);
  }

  /**
   * Allows for immediate use of the API (with master token)
   */
  function checkForMasterUser(token) {
    // Master user (so we can add stuff from the start)
    if (token === config.masterToken) {
      var dbUserObj = new User(config.masterUser);
      return dbUserObj;
    } else {
      return null;
    }
  }

  /**
   * Validates username / password combinations.
   *
   * This should just return a role, or at least not return
   * the password.
   *
   * @method
   */
  function validate(username, password) {
    var deferred = q.defer();
    User.findOne({
      username: username
    }, function(err, record) {
      if (err) {
        logger.error('Error looking for user', err);
        deferred.reject({"message": "Internal System Error."});
      } else {
        if (record.password === password) {
          logger.info('User Login', record.username);
          deferred.resolve(record);
        } else {
          logger.info('Invalid credentials');
          deferred.resolve({});
        }
      }
    });

    return deferred.promise;
  }

  /**
   * Checks for authorization level for a user.
   *
   * @method
   */
  function validateUser(username) {
    var deferred = q.defer();
    User.findOne({"username": username}, 'role').then(function(err, record) {
      if (err) {
        logger.error('Error occured getting user information', err);
        deferred.reject('Internal System Error');
      } else {
        if (record.role) {
          deferred.resolve(record.role);
        } else {
          deferred.resolve({});
        }
      }
    });

    return deferred.promise;
  }

  /**
   * Function to validate a token against mongo.
   *
   * @method
   */
  function validateKey(key) {
    var deferred = q.defer();
    var userObj = new User();

    var dbUserObj = checkForMasterUser(key);

    if (dbUserObj === null) {
      User.findOne({
        token: key
      }, function(err, data) {
        if (err) {
          logger.error('Error looking for key', err);
          deferred.reject(err);
        } else {
          deferred.resolve(data);
        }
      });
    } else {
      deferred.resolve(dbUserObj);
    }
    return deferred.promise;
  }

  /**
   * Helper function for building quick errors.
   *
   * @method
   */
  function buildResponse(res, code, message) {
    logger.info('Failed Login');
    res.status(code);
    res.json({
      "status": code,
      "message": message
    });
  }

  /**
   * Main entry function for login
   *
   * @method
   */
  function login(req, res) {
    var username = req.query.username || '';
    var password = req.query.password || '';

    if (username == '' || password == '') {
      buildResponse(res, 401, "Invalid credentials");
      return;
    }

    // Fire a query to your DB and check if the credentials are valid
    validate(username, password)
      .then(function(dbUserObj) {
        if (!dbUserObj) {
          buildResponse(res, 401, "Invalid credentials");
        } else {
          res.status(200);
          res.json(genToken(dbUserObj));
        }
        return;
      });
  }

  // Exposed functions
  return {
    login: login,
    validateKey: validateKey
  };
};

module.exports = auth;
