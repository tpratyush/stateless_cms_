const User = require('../models/user');

const claimServices = {
  claimPolicy: async (policyId, userId, claimAmount, description) => {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const policyIndex = user.policies.findIndex(p => p.policyId.toString() === policyId);
      if (policyIndex === -1) {
        throw new Error('Policy not found in user\'s policies');
      }

      const userPolicy = user.policies[policyIndex];
      if (claimAmount > userPolicy.policyAmount) {
        throw new Error('Claim amount exceeds total policy amount');
      }

      // Create a new claim (automatically approved)
      const newClaim = {
        policyId: userPolicy.policyId,
        claimAmount: claimAmount,
        description: description,
        claimDate: new Date()
      };

      user.claims.push(newClaim);

      if (claimAmount === userPolicy.policyAmount) {
        user.policies.splice(policyIndex, 1);
      } else {
        userPolicy.policyAmount -= claimAmount;
      }

      await user.save();

      return { 
        message: claimAmount === userPolicy.policyAmount ? 'Policy fully claimed and removed' : 'Policy partially claimed',
        updatedPolicy: userPolicy,
        claim: newClaim
      };
    } catch (error) {
      console.error('Error claiming policy:', error);
      throw error;
    }
  },

  getUserClaims: async (userId) => {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      if (!user.claims || user.claims.length === 0) {
        return { success: false, message: 'No claims found for this user' };
      }

      return { success: true, claims: user.claims };
    } catch (error) {
      console.error('Error fetching user claims:', error);
      return { success: false, message: 'Error retrieving claims', error: error.message };
    }
  }
};

module.exports = claimServices;