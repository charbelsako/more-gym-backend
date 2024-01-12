const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String },
  name: { type: String },
  username: { type: String },
  password: { type: String },
  defaultLocation: { type: String },
  role: { type: String },
});

module.exports = User = mongoose.model('user', userSchema);
