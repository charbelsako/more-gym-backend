const mongoose = require('mongoose');

const packageTypesSchema = new mongoose.Schema(
  {
    type: { type: String },
  },
  {
    timestamps: true,
  }
);

module.exports = PackageType = mongoose.model(
  'packageType',
  packageTypesSchema
);
