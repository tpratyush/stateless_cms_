const express = require('express');
const router = express.Router();
const claimServices = require('../services/claimService');
const authenticateJWT = require('../services/authMiddle'); // Adjust the path as needed

// Existing claim route
router.post('/claim', authenticateJWT, async (req, res) => {
  try {
    const { policyId, claimAmount, description } = req.body;
    const result = await claimServices.claimPolicy(policyId, req.user.id, claimAmount, description);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: 'Error claiming policy', error: error.message });
  }
});

// New route to get user claims
router.get('/user-claims', authenticateJWT, async (req, res) => {
  try {
    const result = await claimServices.getUserClaims(req.user.id);
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;