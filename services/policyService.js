// In-memory storage for policies
let policies = [];
let users = []; // We'll need this for user-related operations

const policyService = {
  getAllPolicies: async () => {
    try {
      console.log('Fetching all policies from memory');
      console.log(`Found ${policies.length} policies`);
      console.log('Policies:', JSON.stringify(policies, null, 2));
      return policies;
    } catch (error) {
      console.error('Error fetching policies:', error);
      throw error;
    }
  },

  addNewPolicy: async (policyData) => {
    try {
      const newPolicy = {
        id: Date.now().toString(),
        ...policyData,
        users: []
      };
      policies.push(newPolicy);
      return newPolicy;
    } catch (error) {
      console.error('Error adding new policy:', error);
      throw error;
    }
  },

  assignPolicyToUser: async (policyId, userId) => {
    try {
      const policy = policies.find(p => p.id === policyId);
      const user = users.find(u => u.id === userId);

      if (!policy) {
        console.error(`Policy with ID ${policyId} not found.`);
        throw new Error('Policy not found');
      }

      if (!user) {
        console.error(`User with ID ${userId} not found.`);
        throw new Error('User not found');
      }

      if (user.policies.some(p => p.policyId === policyId)) {
        console.log(`Policy ${policyId} is already assigned to user ${userId}.`);
        throw new Error('Policy already assigned to user');
      }

      const embeddedPolicy = {
        policyId: policy.id,
        policyName: policy.policyName,
        policyAmount: policy.policyAmount,
        policyExpiryDate: policy.policyExpiryDate
      };

      user.policies.push(embeddedPolicy);
      policy.users.push(userId);

      console.log(`Successfully assigned policy ${policyId} to user ${userId}.`);
      return { policy, user };
    } catch (error) {
      console.error('Error assigning policy to user:', error);
      throw error;
    }
  },

  removePolicyFromUser: async (policyId, userId) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) {
        throw new Error('User not found');
      }

      const policyIndex = user.policies.findIndex(p => p.policyId === policyId);
      if (policyIndex === -1) {
        throw new Error('Policy not found in user\'s policies');
      }

      user.policies.splice(policyIndex, 1);

      const policy = policies.find(p => p.id === policyId);
      if (!policy) {
        throw new Error('Policy not found');
      }

      policy.users = policy.users.filter(id => id !== userId);

      return { policy, user };
    } catch (error) {
      console.error('Error removing policy from user:', error);
      throw error;
    }
  },

  getUserPolicies: async (userId) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) {
        throw new Error('User not found');
      }

      console.log(user.policies);
      return user.policies;
    } catch (error) {
      console.error('Error fetching user policies:', error);
      throw error;
    }
  },
};

module.exports = policyService;