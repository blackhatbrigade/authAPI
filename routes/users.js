/**
 * Promises module.
 */
var q = require('q');

/**
 * Object for user manipulation.
 */
function users(dependencies) {
  /**
   * Main mongoose connector.
   */
  var mongoose = dependencies.getDB();

  /**
   * Mongoose schema for users.
   */
  var userSchema = new (require('../jnt_modules/mongoose/schemas/user'))(mongoose);

  function create(req, res) {
    logger.info('Caught request to create user');
    var params = req.params;
    var deferred = q.defer();

    // Validation of parameters?

    // Check if mongo already has user...
    userSchema.find({ username: req.params.username }, function(err, data) {
      console.log(data);
      if (data) {
        logger.info('User already exists', data);
        deferred.resolve({'message': 'User exists, cannot create again'});
      } else {
        userSchema.username = req.params.username;
        userSchema.password = req.params.password;
        userSchema.role = req.params.role;
        userSchema.dateCreated = new Date();

        userSchema.save(function(err, data) {
          logger.info('Created user: ', data);
          deferred.resolve(data);
        });
      }
    });

    res.json(deferred.promise);
    res.status(200);
    return;
  }

  return {
    create: create,

    getAll: function(req, res) {
        var allusers = data;
        res.json(allusers);
    },

    getOne: function(req, res) {
        var id = req.params.id;
        var user = data[0];
        res.json(user);
    },

    update: function(req, res) {
        var updateuser = req.body;
        var id = req.params.id;
        data[id] = updateuser;
        res.json(updateuser);
    },

    delete: function(req, res) {
        var id = req.params.id;
        data.splice(id, 1);
        res.json(true);
    }
  };
};

module.exports = users;
