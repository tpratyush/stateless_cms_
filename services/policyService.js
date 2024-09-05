const Policy = require('../models/policy');
const User = require('../models/user');

const policyService = {
  getAllPolicies: async () => {
    try {
      const policies = await Policy.find({});
      return policies;
    } catch (error) {
      console.error('Error fetching policies:', error);
      throw error;
    }
  },

  addNewPolicy: async (policyData) => {
    try {
      const newPolicy = new Policy(policyData);
      const savedPolicy = await newPolicy.save();
      return savedPolicy;
    } catch (error) {
      console.error('Error adding new policy:', error);
      throw error;
    }
  },

  assignPolicyToUser: async (policyId, userId) => {
    try {
      const policy = await Policy.findById(policyId);
      const user = await User.findById(userId);

      if (!policy || !user) {
        throw new Error('Policy or User not found');
      }

      if (user.policies.some(p => p.policyId.toString() === policyId)) {
        throw new Error('Policy already assigned to user');
      }

      user.policies.push({
        policyId: policy._id,
        policyName: policy.policyName,
        policyAmount: policy.policyAmount,
        policyExpiryDate: policy.policyExpiryDate
      });

      policy.users.push(userId);

      await user.save();
      await policy.save();

      return { policy, user };
    } catch (error) {
      console.error('Error assigning policy to user:', error);
      throw error;
    }
  },

  removePolicyFromUser: async (policyId, userId) => {
    try {
      const user = await User.findById(userId);
      const policy = await Policy.findById(policyId);

      if (!user || !policy) {
        throw new Error('User or Policy not found');
      }

      user.policies = user.policies.filter(p => p.policyId.toString() !== policyId);
      policy.users = policy.users.filter(id => id.toString() !== userId);

      await user.save();
      await policy.save();

      return { policy, user };
    } catch (error) {
      console.error('Error removing policy from user:', error);
      throw error;
    }
  },

  getUserPolicies: async (userId) => {
    try {
      const user = await User.findById(userId).populate('policies.policyId');
      if (!user) {
        throw new Error('User not found');
      }
      return user.policies;
    } catch (error) {
      console.error('Error fetching user policies:', error);
      throw error;
    }
  },
};

module.exports = policyService;