const express = require('express');
const router = express.Router();
const authService = require('../services/authService');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         password:
 *           type: string
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: token
 */

/**
 * @swagger
 * /user/signup:
 *   post:
 *     summary: User signup
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Successful signup
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: token=abcde12345; HttpOnly
 *       400:
 *         description: Signup error
 */
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  const result = await authService.signup(email, password, name);
  
  if (result.success) {
    res.cookie('token', result.token, { httpOnly: true });
    res.json(result);
  } else {
    res.status(400).json(result);
  }
});

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful login
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: token=abcde12345; HttpOnly
 *       401:
 *         description: Login error
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.loginUser(email, password);
  
  if (result.success) {
    res.cookie('token', result.token, { httpOnly: true });
    res.json(result);
  } else {
    res.status(401).json(result);
  }
});

/**
 * @swagger
 * /user/logout:
 *   post:
 *     summary: User logout
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: token=; HttpOnly; Max-Age=0
 */
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully' });
});

/**
 * @swagger
 * /user/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */
router.get('/user/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    const result = await authService.getUserById(userId);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;