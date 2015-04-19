var express = require('express');

var products = require('./products.js');
var user = require('./users.js');

function routes(dependencies, auth, users) {
  /**
   * Array holding routes to give to express use function.
   */
  var routeArray = [];

  /**
   * Application Logger.
   */
  var logger = dependencies.getLogger();

  /**
   * Routes that can be accessed by any one
   */
  routeArray.push(express.Router()
      .get('/test', function(req, res) {
        logger.info('Test endpoint hit');
        res.send('Endpoint working!');
        return;
      }));

  routeArray.push(express.Router()
      .get('/login', auth.login));

  /**
   * Routes that can be accessed only by authenticated users
   */
  routeArray.push(express.Router()
      .post('/api/v1/admin/user', users.create));

  routeArray.push(express.Router()
      .get('/api/v1/admin/user/:username', users.read));

  this.getRoutes = function () {
    //router.get('/api/v1/products', products.getAll);
    //router.get('/api/v1/product/:id', products.getOne);
    //router.post('/api/v1/product/', products.create);
    //router.put('/api/v1/product/:id', products.update);
    //router.delete('/api/v1/admin/user/:id', user.delete);

    return routeArray;
  };
}

module.exports = routes;
