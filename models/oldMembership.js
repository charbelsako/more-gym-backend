const mongoose = require('mongoose');

const memberShipSchema = new mongoose.Schema({
  type: { type: mongoose.Schema.Types.ObjectId, ref: 'membership' },
  sessionNumber: Number,
  price: Number,
});

module.exports = Membership = mongoose.model('membership', memberShipSchema);
