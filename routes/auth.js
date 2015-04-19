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
   */
  var User = dependencies.getUsers();

  /**
   * App config data.
   */
  var config = dependencies.getConfig();

  var jwt = require('jwt-simple');
  var self = this;

  function genToken(userObj) {
    var deferred = q.defer();
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

  function expiresIn(numDays) {
    var dateObj = new Date();
    return dateObj.setDate(dateObj.getDate() + numDays);
  }

  function checkForMasterUser(token) {
    // Master user (so we can add stuff from the start)
    if (token === 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE0MzAwNjQwNDAyODl9.w59nVHDE3eW3RRWmWD737yn_d2gekD7-e6RvcjCRwMg') {
      var dbUserObj = new User({
        name: 'Jason Bennett',
        role: 'admin',
        username: 'root'
      });
      return dbUserObj;
    } else {
      return null;
    }
  }

  /**
   * Validates username / password combinations
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

  function validateUser(username) {
    var deferred = q.defer();
    User.findOne({"username": username}).then(function(err, record) {
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

  function buildResponse(res, code, message) {
    logger.info('Failed Login');
    res.status(code);
    res.json({
      "status": code,
      "message": message
    });
  }

  return {
    /**
     * Main entry function for login
     */
    login: function (req, res) {
      var username = req.query.username || '';
      var password = req.query.password || '';

      if (username == '' || password == '') {
        buildResponse(res, 401, "Invalid credentials");
        return;
      }

      // Fire a query to your DB and check if the credentials are valid
      validate(username, password).then(function(dbUserObj) {
        if (!dbUserObj) {
          buildResponse(res, 401, "Invalid credentials");
        } else {
          // If authentication is successfull, we will generate a token
          // and dispatch it to the client

          res.status(200);
          res.json(genToken(dbUserObj));
        }
        return;
      });
    },
    validateKey: validateKey
  };
};

module.exports = auth;
