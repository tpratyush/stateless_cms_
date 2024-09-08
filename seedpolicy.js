// seedPolicy.js
const mongoose = require('mongoose');
const Policy = require('./models/policy');
const { v4: uuidv4 } = require('uuid');

const MONGODB_URI = 'mongodb+srv://pratyush2000:Pratyush123@cluster0.icrm9.mongodb.net/'; 

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const seedPolicies = async () => {
  try {
    await Policy.deleteMany({}); // Clear existing policies

    const policies = [];

    for (let i = 0; i < 20; i++) {
      const policy = new Policy({
        policyId: uuidv4(),
        policyName: `Policy ${i + 1}`,
        policyAmount: Math.floor(Math.random() * 10000) + 1000, // Random amount between 1000 and 11000
        policyExpiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)) // 1 year from now
      });

      policies.push(policy);
    }

    await Policy.insertMany(policies);
    console.log('20 policies have been seeded to the database.');
  } catch (error) {
    console.error('Error seeding policies:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedPolicies();
