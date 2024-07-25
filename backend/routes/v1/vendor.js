const express = require('express');
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const passport = require('passport');
const router = express.Router();
const prisma = new PrismaClient();

const postcodesIoUrl = process.env.POSTCODES_IO_URL;

/**
 * @swagger
 * /api/v1/vendor/register:
 *   post:
 *     summary: Register a new vendor
 *     tags: [Vendor]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
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
 *       201:
 *         description: Vendor registered successfully
 *       500:
 *         description: Internal Server Error
 */
router.post('/register', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { name, email, postcode, location, openingTimes, contactInfo } = req.body;

  try {
    const existingVendor = await prisma.vendor.findUnique({ where: { email } });
    if (existingVendor) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    const response = await axios.get(`${postcodesIoUrl}/${postcode}`);
    if (response.data.status !== 200) {
      return res.status(400).json({ error: 'Invalid postcode' });
    }

    const vendor = await prisma.vendor.create({
      data: {
        name,
        email,
        latitude: response.data.result.latitude,
        longitude: response.data.result.longitude,
        location,
        openingTimes,
        contactInfo,
        userId: req.user.id,
      },
    });

    res.status(201).json(vendor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/v1/vendor/update:
 *   put:
 *     summary: Update vendor profile
 *     tags: [Vendor]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               name:
 *                 type: string
 *               email:
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
 *         description: Vendor updated successfully
 *       500:
 *         description: Internal Server Error
 */
router.put('/update', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { id, name, email, postcode, location, openingTimes, contactInfo } = req.body;

  try {
    const data = {};
    if (name) data.name = name;
    if (email) {
      const existingVendor = await prisma.vendor.findUnique({ where: { email } });
      if (existingVendor && existingVendor.id !== id) {
        return res.status(400).json({ error: 'Email already in use.' });
      }
      data.email = email;
    }
    if (postcode) {
      const response = await axios.get(`${postcodesIoUrl}/${postcode}`);
      if (response.data.status !== 200) {
        return res.status(400).json({ error: 'Invalid postcode' });
      }
      data.latitude = response.data.result.latitude;
      data.longitude = response.data.result.longitude;
    }
    if (location) data.location = location;
    if (openingTimes) data.openingTimes = openingTimes;
    if (contactInfo) data.contactInfo = contactInfo;

    const vendor = await prisma.vendor.update({
      where: { id },
      data,
    });

    res.status(200).json(vendor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
