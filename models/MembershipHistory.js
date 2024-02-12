const mongoose = require('mongoose');

const memberShipHistorySchema = new mongoose.Schema({
  membership: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'membership',
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
});

module.exports = MembershipHistory = mongoose.model(
  'membershipHistory',
  memberShipHistorySchema
);
