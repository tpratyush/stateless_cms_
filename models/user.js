const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  policies: [{
    policyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Policy'
    },
    policyName: String,
    policyAmount: Number,
    policyExpiryDate: Date
  }],
  claims: [{
    policyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Policy'
    },
    claimAmount: Number,
    claimDate: {
      type: Date,
      default: Date.now
    },
    description: String
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password for login
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;