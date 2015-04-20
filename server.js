var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var app = express();
var dep = require('./config/dependencies');
var router = require('./routes');

// Spoolup for API services

/**
 * Handles all dependencies needed by app modules.
 */
var dependencies = new dep();

/**
 * Authorization module for users.
 */
var authModule = new (require('./routes/auth.js'))(dependencies);

/**
 * Module that handles validation of users.
 */
var validationModule = new (require('./middlewares/validateRequest.js'))(dependencies, authModule);

/**
 * User manipulation.
 */
var users = new (require('./routes/users.js'))(dependencies);

/**
 * Main routes definition.
 */
var routes = new router(dependencies, authModule, users);

var config = dependencies.getConfig();

/**
 * Application logger.
 */
var logger = dependencies.getLogger();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.all('/*', function(req, res, next) {
  // CORS headers
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  //Set custom headers for CORS
  res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
  if (req.method == 'OPTIONs') {
    res.status(200).end();
  } else {
    next();
  }
});

// Auth Middleware - This will check if the token is valid
// Only the requests that start with /api/v1/* will be checked for the token.
// Any URL's that do not follow the below pattern should be avoided unless you
// are sure that authentication is not needed.
app.all('/api/v1/*', validationModule.validateUser);

//routes.getRoutes();
app.use('/', routes.getRoutes());

// If no route is matched by now, it must be a 404
app.use(function(req, res, next) {
  logger.info('Invalid endpoint hit: ' + req.originalUrl);
  res.status = 404;
  res.json({'message': 'Not Found'});
  next();
});

// Start the server
app.set('port', config.nodePort);

console.log('Attempting to setup nodejs on port', config.nodePort);
var server = app.listen(config.nodePort, function() {
  console.log('Express server listening on port ' + server.address().port);
});
