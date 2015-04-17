var auth = function (mongoose, config) {
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

    var db = mongoose.connection
        , dbUserObj = checkForMasterUser(username, password);

    if (dbUserObj === null) {

      db.on('error', console.error.bind(console, 'connection error:'));
      db.once('open', function (callback) {
        userModel.findOne({
          username: username
        });
      });
    }
    return null;
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

  return {
    /**
     * Main entry function for login
     */
    login: function (req, res) {
      var username = req.body.username || '';
      var password = req.body.password || '';
      console.log(req.body);
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
    }
  };
};

module.exports = auth;
