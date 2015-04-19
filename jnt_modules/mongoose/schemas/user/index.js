var mongoose = require('mongoose');

function userSchema(logger) {
  var userSchemaObj = new mongoose.Schema({
      username: { type: String },
      password: { type: String },
      role: { type: String },
      dateCreated: { type: Date },
      token: { type: String },
      token_exp: { type: Date }
  });

  var userModelObj = null;

  function getUserModel(conn) {
    if (userModelObj === null) {
      userModelObj = conn.model('user', userSchemaObj);
    }
    return userModelObj;
  }

  return {
    getUserModel: getUserModel
  };
};

module.exports = userSchema;
