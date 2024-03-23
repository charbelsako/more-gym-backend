const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema(
  {
    type: { type: mongoose.Schema.Types.ObjectId, ref: 'packageType' },
    subType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'packageSubType',
    },
    sessionType: String,
    price: Number,
  },
  {
    timestamps: true,
  }
);

module.exports = Membership = mongoose.model('membership', membershipSchema);
