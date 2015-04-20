/**
 * MAGIC!!!
 */
var jwt = require('jwt-simple');

/**
 * Functionality to authenticate and authorize a user.
 */
var userValidatingLib = require('../routes/auth.js');

/**
 * Manages User Validation.
 */
function validateUser(dependencies, authModule) {
  /**
   * Connection to Mongo.
   */
  var mongoose = dependencies.getDB();

  /**
   * Logger for app.
   */
  var logger = dependencies.getLogger();

  /**
   * Helper function to pull logic out of a big damn if.
   *
   * This needs to be config driven so that access levels are not
   * in the url.
   *
   * @method
   */
  function accessLevels(url, userRole) {
    // Handle Admin level requests.
    if (url.indexOf('admin') >= 0 && userRole === 'admin') {
      return true;
    }

    // Handle v1 requests.
    if (url.indexOf('admin') < 0 && url.indexOf('/api/v1') >= 0) {
      return true;
    }

    return false;
  }

  /**
   * Validates a login attempt with a token.
   */
  this.validateUser = function (req, res, next) {
    // When performing a cross domain request, you will recieve
    // a preflighted request first.  This is to check if the app
    // is safe.

    // We skip the token oauth for [OPTIONS] requests.
    // if(req.method == 'OPTIONS') next();

    var token = req.headers['x-access-token'];

    if (!token) {
      logger.info('Caught attempt to use endpoint without token');
      res.json({
        "status": 401,
        "message": "Invalid Token or Key"
      });
      res.status(401);
      return;
    }

    try { 
      var decoded = jwt.decode(token, require('../config/secret.js')()); 
      if (decoded.exp <= Date.now()) { 
        res.status(400);
        res.json({
          "status": 400,
          "message": "Token Expired"
        });
        return;
      }

      // Use authModule to determine if token is valid.
      // Still sloppy, but better
      authModule.validateKey(token)
        .then(function(dbUser) {
          if (!dbUser) {
            res.status(401);
            return;
          }

          // Checking if the user has the appropriate roles for the action requested.
          // Sloppy as fuck
          if (accessLevels(req.url, dbUser.role)) {
            next();
            return;
          } else {
            res.status(403);
            res.json({
              "status": 403,
              "message": "Not Authorized"
            });
            return;
          }
        });
    } catch (err) {
      logger.error(err);
      res.status(500);
      res.json({
        "status": 500,
        "message": "Oops something went wrong",
        "error": err
      });
    }
  }
}

module.exports = validateUser;
