const User = require('../models/user');

const claimServices = {
  claimPolicy: async (policyId, userId, claimAmount) => {
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

      if (claimAmount === userPolicy.policyAmount) {
        user.policies.splice(policyIndex, 1);
      } else {
        userPolicy.policyAmount -= claimAmount;
      }

      await user.save();

      return { 
        message: claimAmount === userPolicy.policyAmount ? 'Policy fully claimed and removed' : 'Policy partially claimed',
        updatedPolicy: userPolicy
      };
    } catch (error) {
      console.error('Error claiming policy:', error);
      throw error;
    }
  }
};

module.exports = claimServices;