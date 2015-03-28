var auth = function(mongoose) {
    var jwt = require('jwt-simple');
    var settings = require('../config');

    function checkForMasterUser(username, password) {
        // Master user (so we can add stuff from the start)
        if (username === "root" && password === "t0mc@t") {
            var dbUserObj = {
                name: 'root',
                role: 'admin',
                username: 'Jason.Bennett'
            }
            return dbUserObj;
        } else {
            return null;
        }
    }


    return {
    login: function(req, res) {
        var username = req.body.username || '';
        var password = req.body.password || '';

        if (username == '' || password == '') {
            res.status(401);
            res.json({
                "status": 401,
                "message": "Invalid credentials"
            });
            return;
        }

        // Fire a query to your DB and check if the credentials are valid
        var dbUserObj = auth.validate(username, password);

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
    validate: function(username, password) {
        mongoose.connect(settings.mongodb);
        var db = mongoose.connection
        ,   dbUserObj = checkForMasterUser(username, password);

        if (dbUserObj) {
            return dbUserObj;
        }

        db.on('error', console.error.bind(console, 'connection error:'));
        db.once('open', function (callback) {
            
        });

        return dbUserObj;
    },

    validateUser: function(username) {
        // Master user (so we can add stuff from the start)
        if (username === "root" && password === "t0mc@t") {
            var dbUserObj = {
                name: 'root',
                role: 'admin',
                username: 'Jason.Bennett'
        }

        // TODO: Add check for user privledges

        return dbUserObj;
    }
  }
    }
}

// private method
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

module.exports = auth;
