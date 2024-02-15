const mongoose = require('mongoose');

const packageSubtypeSchema = new mongoose.Schema(
  {
    numberOfSessions: { type: Number },
  },
  {
    timestamps: true,
  }
);

module.exports = PackageSubtype = mongoose.model(
  'packageSubType',
  packageSubtypeSchema
);
