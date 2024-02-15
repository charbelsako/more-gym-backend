const mongoose = require('mongoose');
const { trainerTypes } = require('../constants');

const userSchema = new mongoose.Schema({
  email: { type: String },
  name: { type: String },
  username: { type: String },
  password: { type: String },
  defaultLocation: { type: String },
  role: { type: String },
  refreshToken: { type: String },
  schedule: {
    type: [
      {
        day: { type: String },
        availableTimes: {}, // @NOTE: this is open because specific schema is not yet agreed upon (or optimized)
      },
    ],
    default: undefined,
  },
  trainerType: { type: String, enum: Object.values(trainerTypes) },
  membership: { type: mongoose.Schema.Types.ObjectId, ref: 'membership' },
  membershipStartDate: Date,
  membershipEndDate: Date,
});

module.exports = User = mongoose.model('user', userSchema);
