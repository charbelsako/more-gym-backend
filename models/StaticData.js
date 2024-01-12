const mongoose = require('mongoose');

const staticData = new mongoose.Schema({
  locations: { type: [String] }, // different branches of the gym
  cancelTime: { type: Number }, // time in hours before a user is unable to cancel the appointment
  classTypes: { type: [String] }, // available types of classes (boxing, pt)
});

module.exports = StaticData = mongoose.model('staticData', staticData);
