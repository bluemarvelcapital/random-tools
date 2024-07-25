const express = require('express');
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const haversine = require('haversine-distance');
const router = express.Router();
const prisma = new PrismaClient();

const postcodesIoUrl = process.env.POSTCODES_IO_URL;

/**
 * @swagger
 * /api/v1/user/vendors/nearby:
 *   get:
 *     summary: Get vendors within a radius of a given postcode
 *     tags: [User]
 *     parameters:
 *       - in: query
 *         name: postcode
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: radius
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: A list of vendors within the given radius
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                   latitude:
 *                     type: number
 *                   longitude:
 *                     type: number
 */
router.get('/vendors/nearby', async (req, res) => {
  const { postcode, radius } = req.query;

  try {
    const response = await axios.get(`${postcodesIoUrl}/${postcode}`);
    if (response.data.status !== 200) {
      return res.status(400).json({ error: 'Invalid postcode' });
    }

    const userLocation = {
      latitude: response.data.result.latitude,
      longitude: response.data.result.longitude,
    };

    const vendors = await prisma.vendor.findMany();
    const nearbyVendors = vendors.filter((vendor) => {
      const vendorLocation = {
        latitude: vendor.latitude,
        longitude: vendor.longitude,
      };
      const distance = haversine(userLocation, vendorLocation) / 1609.34; // Convert meters to miles
      return distance <= radius;
    });

    res.json(nearbyVendors);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(400).json({ error: 'Invalid postcode' });
    } else {
      return res.status(500).json({ error: error.message });
    }
  }
});

/**
 * @swagger
 * /api/v1/user/vendor/{vendorId}/products:
 *   get:
 *     summary: Get products of a specific vendor
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: vendorId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   price:
 *                     type: number
 *                   stock:
 *                     type: integer
 */
router.get('/vendor/:vendorId/products', async (req, res) => {
  const { vendorId } = req.params;
  try {
    const products = await prisma.product.findMany({
      where: { vendorId },
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
