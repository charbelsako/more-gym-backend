const mongoose = require('mongoose');

const trainerPackageTypes = {
  SOLO: 'Solo',
  DUO: 'Duo',
  TRIO: 'Trio',
  GROUP: 'Group',
};

const trainerPackageTypesSchema = new mongoose.Schema({
  type: { type: String, enum: Object.values(trainerPackageTypes) },
  capacity: Number,
});

module.exports = TrainerPackageType = mongoose.model(
  'trainerPackageType',
  trainerPackageTypesSchema
);
