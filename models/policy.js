const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
  policyName: {
    type: String,
    required: true
  },
  policyAmount: {
    type: Number,
    required: true,
    min: 0
  },
  policyExpiryDate: {
    type: Date,
    required: true
  },
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

const Policy = mongoose.model('Policy', policySchema);

module.exports = Policy;