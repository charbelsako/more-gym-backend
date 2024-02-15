const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema({
  type: { type: mongoose.Schema.Types.ObjectId, ref: 'packageType' },
  capacity: { type: mongoose.Schema.Types.ObjectId, ref: 'sessionType' },
});

module.exports = Membership = mongoose.model('membership', membershipSchema);
