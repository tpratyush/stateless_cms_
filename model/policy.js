// models/Policy.js

class Policy {
    constructor(policyData) {
      this.id = policyData.id || Date.now().toString();
      this.policyName = policyData.policyName;
      this.policyAmount = policyData.policyAmount;
      this.policyExpiryDate = policyData.policyExpiryDate;
      this.users = policyData.users || [];
      this.createdAt = policyData.createdAt || new Date();
      this.updatedAt = policyData.updatedAt || new Date();
    }
  
    update(updateData) {
      Object.assign(this, updateData);
      this.updatedAt = new Date();
    }
  }
  
  module.exports = Policy;