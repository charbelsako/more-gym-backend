const mongoose = require('mongoose');

const memberShipHistorySchema = new mongoose.Schema(
  {
    membership: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'membership',
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    membershipStartDate: Date,
    memberShipEndDate: Date,
  },
  {
    timestamps: true,
  }
);

module.exports = MembershipHistory = mongoose.model(
  'membershipHistory',
  memberShipHistorySchema
);
