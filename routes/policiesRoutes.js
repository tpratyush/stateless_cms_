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
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: token
 */

/**
 * @swagger
 * /dashboard/policies:
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
    try {
        const policies = await policyService.getAllPolicies();
        res.render('policies', { policies }); // Render policies view
    } catch (error) {
        res.status(500).json({ message: 'Error fetching policies', error: error.message });
    }
});

module.exports = router;