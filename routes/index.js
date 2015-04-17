var express = require('express');

var products = require('./products.js');
var user = require('./users.js');

function routes(router, auth) {

  this.getRoutes = function () {

    /**
     * Routes that can be accessed by any one
     */
    router.post('/login', auth.login);

    /**
     * Routes that can be accessed only by authenticated users
     */
    router.get('/api/v1/products', products.getAll);
    router.get('/api/v1/product/:id', products.getOne);
    router.post('/api/v1/product/', products.create);
    router.put('/api/v1/product/:id', products.update);
    router.delete('/api/v1/admin/user/:id', user.delete);
    console.log("Routes Loaded");
  };
}
module.exports = routes;