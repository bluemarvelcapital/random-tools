const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const { ensureAuthenticated } = require('../../middleware/auth');
const vendorService = require('../../services/vendorService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new vendor
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
 *               name:
 *                 type: string
 *               postcode:
 *                 type: string
 *               location:
 *                 type: string
 *               openingTimes:
 *                 type: string
 *               contactInfo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Vendor registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 vendor:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Failed to register vendor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.post('/register', [
  check('email').isEmail().withMessage('Please enter a valid email'),
  check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  check('name').not().isEmpty().withMessage('Name is required'),
  check('postcode').not().isEmpty().withMessage('Postcode is required'),
  check('location').not().isEmpty().withMessage('Location is required'),
  check('openingTimes').not().isEmpty().withMessage('Opening times are required'),
  check('contactInfo').not().isEmpty().withMessage('Contact info is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error('Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, name, postcode, location, openingTimes, contactInfo } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const vendorData = {
      id: uuidv4(), // Generate UUID for vendor ID
      email,
      password: hashedPassword,
      name,
      postcode,
      location,
      openingTimes,
      contactInfo,
      status: 'pending'
    };

    const vendor = await vendorService.registerVendor(vendorData);

    res.status(200).json({ message: 'Vendor registered successfully', vendor });
  } catch (error) {
    console.error('Error registering vendor:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login a vendor
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
 *         description: Vendor logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                 vendor:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Failed to login vendor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.post('/login', [
  check('email').isEmail().withMessage('Please enter a valid email'),
  check('password').not().isEmpty().withMessage('Password is required')
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error('Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  passport.authenticate('local', { session: false }, async (err, user, info) => {
    if (err || !user) {
      console.error('Authentication error:', err || (info && info.message) || 'Login failed');
      return res.status(401).json({ error: (info && info.message) || 'Login failed' });
    }

    req.login(user, { session: false }, async (err) => {
      if (err) {
        console.error('Login error:', err);
        return res.status(500).json({ error: 'Login failed. Please try again later.' });
      }

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });

      const response = {
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      };

      if (user.role === 'vendor') {
        // Fetch the vendor details
        const vendor = await prisma.vendor.findUnique({ where: { email: user.email } });

        if (!vendor) {
          console.error('Vendor not found for email:', user.email);
          return res.status(404).json({ error: 'Vendor not found' });
        }

        const { password: _, ...vendorWithoutPassword } = vendor;
        response.vendor = vendorWithoutPassword;
      }

      return res.status(200).json(response);
    });
  })(req, res, next);
});

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout a user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: User logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.post('/logout', ensureAuthenticated, (req, res) => {
  req.logout();
  res.status(200).json({ message: 'Logout successful' });
});

module.exports = router;
