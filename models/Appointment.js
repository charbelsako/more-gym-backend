const mongoose = require('mongoose');
const { appointmentStatus } = require('../constants');

const appointmentSchema = new mongoose.Schema({
  trainerId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  date: Date,
  time: Number, // 8 or 9 or 10 ....
  status: { type: String, enum: Object.values(appointmentStatus) },
});

module.exports = Appointments = mongoose.model(
  'appointment',
  appointmentSchema
);
