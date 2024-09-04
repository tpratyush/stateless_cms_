const express = require('express');
const claimServices = require('../services/claimService');
const authenticateJWT = require('../services/authMiddle');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Claim:
 *       type: object
 *       properties:
 *         policyId:
 *           type: string
 *         userId:
 *           type: string
 *         claimAmount:
 *           type: number
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: token
 */

/**
 * @swagger
 * /api/claims/claim:
 *   post:
 *     summary: File a claim
 *     tags: [Claims]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Claim'
 *     responses:
 *       200:
 *         description: Claim filed successfully
 *       400:
 *         description: Error filing claim
 *       401:
 *         description: Unauthorized
 */
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