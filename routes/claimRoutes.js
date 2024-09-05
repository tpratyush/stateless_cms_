const express = require('express');
const router = express.Router();
const claimServices = require('../services/claimService');
const authenticateJWT = require('../services/authMiddle');

router.post('/claim', authenticateJWT, async (req, res) => {
  try {
    const { policyId, userId, claimAmount } = req.body;
    const result = await claimServices.claimPolicy(policyId, userId, claimAmount);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: 'Error claiming policy', error: error.message });
  }
});

module.exports = router;