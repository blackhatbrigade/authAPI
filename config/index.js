module.exports = function() {
  var ipAddress = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

  var port = process.env.OPENSHIFT_NODEJS_PORT || 4010;

  var mongoAddress = process.env.OPENSHIFT_MONGODB_DB_HOST || 'localhost';

  var mongoPort = process.env.OPENSHIFT_MONGODB_DB_PORT || 27017;

  var mongoUser = 'admin';

  var mongoPass = 'IGA5fRuDM2lp';

  var mongoDb = 'bhb';

  var mongoFullAddress = 'mongodb://' + mongoUser + ':' + mongoPass + '@' + mongoAddress + ':' + mongoPort + '/' + mongoDb;

  var masterToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE0MzAwNjQwNDAyODl9.w59nVHDE3eW3RRWmWD737yn_d2gekD7-e6RvcjCRwMg';

  var masterUser = {
    name: 'Jason Bennett',
    role: 'admin',
    username: 'root'};

  return {
    mongodb: mongoFullAddress,
    nodePort: port,
    nodeIp: ipAddress,
    masterToken: masterToken,
    masterUser: masterUser
  };
}();
