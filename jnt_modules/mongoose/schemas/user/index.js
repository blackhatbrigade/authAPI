function userSchema(mongoose) {
  var Schema = mongoose.Schema;
  return new Schema({
    username: String,
    password: String,
    role: String,
    dateCreated: Date
});
}

module.exports = userSchema;