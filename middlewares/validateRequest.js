var jwt = require('jwt-simple');
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

  this.validateUser = function (req, res, next) {
    // When performing a cross domain request, you will recieve
    // a preflighted request first.  This is to check if the app
    // is safe.

    // We skip the token oauth for [OPTIONS] requests.
    // if(req.method == 'OPTIONS') next();

    var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'];
    var key = (req.body && req.body.x_key) || (req.query && req.query.x_key) || req.headers['x-key'];

    if (token || key) {
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

        // Authorize the user to see if s/he can access our resources
        // This will require having a function that checks mongo for
        // a active key with the given value.
        var dbUser = authModule.validateKey(key);
        logger.info('Got user validation details', dbUser);
        if (dbUser) {

          if ((req.url.indexOf('admin') >= 0 && dbUser.role == 'admin') || (req.url.indexOf('admin') < 0 && req.url.indexOf('/api/v1/') >= 0)) {
            next();
          } else {
            res.status(403);
            res.json({
              "status": 403,
              "message": "Not Authorized"
            });
            return;
          }
        } else {
          // No user with this name exists, respond back with a 401
          res.status(401);
          res.json({
            "status": 401,
            "message": "Invalid User"
          });
          return;
        }

      } catch (err) {
        res.status(500);
        res.json({
          "status": 500,
          "message": "Oops something went wrong",
          "error": err
        });
      }
    } else {
      res.status(401);
      res.json({
        "status": 401,
        "message": "Invalid Token or Key"
      });
      return;
    }
  }
}
;

module.exports = validateUser;
