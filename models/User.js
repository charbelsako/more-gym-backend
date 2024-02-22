const mongoose = require('mongoose');
const { trainerTypes } = require('../constants');

const availableTimesSchema = new mongoose.Schema({
  day: { type: String },
  availableTimes: {},
});

const locationSchema = new mongoose.Schema({
  _id: false,
  location: { type: String, required: true },
  availability: [availableTimesSchema],
});

const userSchema = new mongoose.Schema(
  {
    email: { type: String },
    name: { type: String },
    username: { type: String },
    password: { type: String },
    defaultLocation: { type: String },
    role: { type: String },
    refreshToken: { type: String },
    schedule: {
      type: [locationSchema],
      default: undefined,
    },
    trainerType: { type: String, enum: Object.values(trainerTypes) },
    membership: { type: mongoose.Schema.Types.ObjectId, ref: 'membership' },
    membershipStartDate: Date,
    membershipEndDate: Date,
    numberOfSessions: Number,
    totalSessions: Number,
    locations: [String],
  },
  { timestamps: true }
);

module.exports = User = mongoose.model('user', userSchema);
