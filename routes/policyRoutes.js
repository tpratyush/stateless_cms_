const express = require('express');
const router = express.Router();
const policyService = require('../services/policyService');
const authenticateJWT = require('../services/authMiddle');

router.get('/', authenticateJWT, async (req, res) => {
  try {
    const policies = await policyService.getAllPolicies();
    res.json(policies);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching policies', error: error.message });
  }
});

router.post('/', authenticateJWT, async (req, res) => {
  try {
    const newPolicy = await policyService.addNewPolicy(req.body);
    res.status(201).json(newPolicy);
  } catch (error) {
    res.status(400).json({ message: 'Error creating new policy', error: error.message });
  }
});

router.post('/assign', authenticateJWT, async (req, res) => {
  try {
    const { policyId, userId } = req.body;
    const result = await policyService.assignPolicyToUser(policyId, userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: 'Error assigning policy to user', error: error.message });
  }
});

router.post('/remove', authenticateJWT, async (req, res) => {
  try {
    const { policyId, userId } = req.body;
    const result = await policyService.removePolicyFromUser(policyId, userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: 'Error removing policy from user', error: error.message });
  }
});

router.post('/user-policies', authenticateJWT, async (req, res) => {
  try {
    const userId = req.body.userId;
    const policies = await policyService.getUserPolicies(userId);
    res.json(policies);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user policies' });
  }
});

module.exports = router;