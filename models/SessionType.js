const mongoose = require('mongoose');

const sessionTypes = new mongoose.Schema(
  {
    numberOfSessions: { type: Number },
  },
  {
    timestamps: true,
  }
);

module.exports = SessionType = mongoose.model('sessionType', sessionTypes);
