module.exports = function() {
  var ipAddress = process.env.OPENSHIFT_NODEJS_IP;

  var port = process.env.OPENSHIFT_NODEJS_PORT || 4000;

  var mongoAddress = process.env.OPENSHIFT_MONGODB_DB_HOST || 'localhost';

  var mongoPort = process.env.OPENSHIFT_MONGODB_DB_PORT || 27017;

  var mongoUser = 'admin';

  var mongoPass = 'IGA5fRuDM2lp';

  var mongoDb = 'bhb';

  var mongoFullAddress = 'mongodb://' + mongoUser + ':' + mongoPass + '@' + mongoAddress + ':' + mongoPort + '/' + mongoDb;

  return {
    mongodb: mongoFullAddress
  };
}();
