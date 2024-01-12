const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String },
  password: { type: String },
  defaultLocation: { type: String },
});

module.exports = User = mongoose.model('user', userSchema);
