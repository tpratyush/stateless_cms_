const express = require('express');
const router = express.Router();
const policyService = require('../services/policyService');
const authenticateJWT = require('../services/authMiddle');

/**
 * @swagger
 * components:
 *   schemas:
 *     Policy:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         coverageAmount:
 *           type: number
 *     PolicyAssignment:
 *       type: object
 *       properties:
 *         policyId:
 *           type: string
 *         userId:
 *           type: string
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: token
 */

/**
 * @swagger
 * /api/policies:
 *   get:
 *     summary: Get all policies
 *     tags: [Policies]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of all policies
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Policy'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Error fetching policies
 */
router.get('/', authenticateJWT, async (req, res) => {
  console.log('GET /api/policies request received');
  try {
    const policies = await policyService.getAllPolicies();
    console.log('Policies fetched successfully, sending response:', JSON.stringify(policies));
    res.json(policies);
  } catch (error) {
    console.error('Error in GET /api/policies:', error);
    res.status(500).json({ message: 'Error fetching policies', error: error.message });
  }
});

/**
 * @swagger
 * /api/policies:
 *   post:
 *     summary: Create a new policy
 *     tags: [Policies]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Policy'
 *     responses:
 *       201:
 *         description: Policy created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Policy'
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Error creating new policy
 */
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const newPolicy = await policyService.addNewPolicy(req.body);
    res.status(201).json(newPolicy);
  } catch (error) {
    res.status(400).json({ message: 'Error creating new policy', error: error.message });
  }
});

/**
 * @swagger
 * /api/policies/assign:
 *   post:
 *     summary: Assign a policy to a user
 *     tags: [Policies]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PolicyAssignment'
 *     responses:
 *       200:
 *         description: Policy assigned successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Error assigning policy to user
 */
router.post('/assign', authenticateJWT, async (req, res) => {
  try {
    const { policyId, userId } = req.body;
    const result = await policyService.assignPolicyToUser(policyId, userId);
    res.status(200).json(result);
  } catch (error) {
    if (error.message === 'Policy already assigned to user' || error.message === 'User already associated with policy') {
      res.status(400).json({ message: error.message });
    } else {
      res.status(400).json({ message: 'Error assigning policy to user', error: error.message });
    }
  }
});

/**
 * @swagger
 * /api/policies/remove:
 *   post:
 *     summary: Remove a policy from a user
 *     tags: [Policies]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PolicyAssignment'
 *     responses:
 *       200:
 *         description: Policy removed successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Error removing policy from user
 */
router.post('/remove', authenticateJWT, async (req, res) => {
  try {
    const { policyId, userId } = req.body;
    const result = await policyService.removePolicyFromUser(policyId, userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: 'Error removing policy from user', error: error.message });
  }
});

/**
 * @swagger
 * /api/policies/user-policies:
 *   post:
 *     summary: Get policies assigned to a user
 *     tags: [Policies]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: List of user policies
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Policy'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Error fetching user policies
 */
router.post('/user-policies', authenticateJWT, async (req, res) => {
  try {
    const userId = req.body.userId;
    console.log(userId);
    const policies = await policyService.getUserPolicies(userId);
    res.json(policies);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user policies' });
  }
});

module.exports = router;