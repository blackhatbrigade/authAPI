/**
 * Object that handles user authorization against DB.
 */
var auth = function (dependencies) {
  /**
   * App mongoose instance.
   */
  var mongoose = dependencies.getDB();

  /**
   * App Logger instance.
   */
  var logger = dependencies.getLogger();

  /**
   * App config data.
   */
  var config = dependencies.getConfig();

  var jwt = require('jwt-simple');
  var self = this;
  var userSchema = require('../jnt_modules/mongoose/schemas/user');

  function genToken(user) {
    var expires = expiresIn(7); // 7 days
    var token = jwt.encode({
      exp: expires
    }, require('../config/secret')());

    return {
      token: token,
      expires: expires,
      user: user
    };
  }

  function expiresIn(numDays) {
    var dateObj = new Date();
    return dateObj.setDate(dateObj.getDate() + numDays);
  }

  function checkForMasterUser(username, password) {
    // Master user (so we can add stuff from the start)
    if (username === "root" && password === "t0mc@t") {
      var dbUserObj = {
        name: 'Jason Bennett',
        role: 'admin',
        username: 'root'
      };
      return dbUserObj;
    } else {
      return null;
    }
  }

  function validate(username, password) {
    mongoose.connect(config.mongodb);
    var userSchemaObj = new userSchema(mongoose);
    var userModel = mongoose.model('user', userSchemaObj);

    var db = mongoose.connection;
    var dbUserObj = checkForMasterUser(username, password);

    if (dbUserObj === null) {

      db.on('error', console.error.bind(console, 'connection error:'));
      db.once('open', function (callback) {
        userModel.findOne({
          username: username
        });
      });
    }
    return dbUserObj;
  }

  function validateUser(username) {
    // Master user (so we can add stuff from the start)
    if (username === "root" && password === "t0mc@t") {
      var dbUserObj = {
        name: 'root',
        role: 'admin',
        username: 'Jason.Bennett'
      };

      // TODO: Add check for user privledges

      return dbUserObj;
    }
  }

  /**
   * Function to validate a token against mongo.
   */
  function validateKey(key) {

  }

  return {
    /**
     * Main entry function for login
     */
    login: function (req, res) {
      var username = req.query.username || '';
      var password = req.query.password || '';

      if (username == '' || password == '') {
        res.status(401);
        res.json({
          "status": 401,
          "message": "Invalid credentials"
        });
        return;
      }

      // Fire a query to your DB and check if the credentials are valid
      var dbUserObj = validate(username, password);

      if (!dbUserObj) {
        res.status(401);
        res.json({
          "status": 401,
          "message": "Invalid credentials"
        });
        return;
      }

      if (dbUserObj) {
        // If authentication is successfull, we will generate a token
        // and dispatch it to the client

        res.json(genToken(dbUserObj));
      }
    },
    validateKey: validateKey
  };
};

module.exports = auth;
