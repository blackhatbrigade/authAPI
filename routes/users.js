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
  var conn = dependencies.getDB();

  var logger = dependencies.getLogger();

  var Users = dependencies.getUsers();

  function create(req, res) {
    var params = req.body;

    // Verify user has permission for this operation.

    // Validation of parameters

    // Check if mongo already has user...
    Users.findOne({ username: params.username }, function(err, data) {
      if (data) {
        res.json({'message': 'User exists, cannot create again'});
      } else {
        var newUser = new Users();
        newUser.username = params.username;
        newUser.password = params.password;
        newUser.role = params.role;
        newUser.dateCreated = new Date();

        newUser.save(function(err, data) {
          logger.info('Created user: ', data);
          res.json(data);
        });
      }
    });
  }

  function read(req, res) {
    var deferred = q.defer();
    
    Users.find({"username": req.params.username}, function(err, record) {
      if (err) {
        logger.error(err);
        res.json({});
        return;
      }
      if (record.length > 0) {
        res.json({
          'username': record[0].username,
          'role': record[0].role,
          'dateCreated': record[0].dateCreated
        });
      } else {
        res.json({
          'status': 200,
          'message': 'User not found'
        });
      }
    });
  }

  return {
    create: create,
    read: read
  };
};

module.exports = users;
