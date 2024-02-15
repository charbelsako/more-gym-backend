const mongoose = require('mongoose');

const trainerPackageTypesSchema = new mongoose.Schema({
  type: { type: mongoose.Schema.Types.ObjectId, ref: 'packageType' },
  capacity: { type: mongoose.Schema.Types.ObjectId, ref: 'sessionType' },
});

module.exports = TrainerPackageType = mongoose.model(
  'trainerPackageType',
  trainerPackageTypesSchema
);
