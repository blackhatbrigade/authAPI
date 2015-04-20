/**
 * Promises module.
 * (Maybe user Bluebird?)
 *
 */
var q = require('q');

/**
 * Object for user manipulation.
 */
function users(dependencies) {
  /**
   * Main mongoose connector.
   *
   * @property
   */
  var conn = dependencies.getDB();

  /**
   * Main App logger.
   *
   * @property
   */
  var logger = dependencies.getLogger();

  /**
   * Mongoose Model for users.
   *
   * @property
   */
  var Users = dependencies.getUsers();

  /**
   * Endpoint for creating Users.
   *
   * @method
   */
  function create(req, res) {
    var params = req.body;

    // Verify user has permission for this operation.

    // Validation of parameters

    // Check if mongo already has user...
    Users.findOne({ username: params.username }, 'username', function(err, data) {
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

  /**
   * Endpoint for reading a User.
   *
   * @method
   */
  function read(req, res) {
    Users.find({"username": req.params.username}, 'username role dateCreated', function(err, record) {
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

  /**
   * Exposed functionality.
   */
  return {
    create: create,
    read: read
  };
};

module.exports = users;
