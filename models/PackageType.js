const mongoose = require('mongoose');

const packageTypesSchema = new mongoose.Schema(
  {
    type: { type: String },
    capacity: { type: Number },
  },
  {
    timestamps: true,
  }
);

module.exports = PackageType = mongoose.model(
  'packageType',
  packageTypesSchema
);
