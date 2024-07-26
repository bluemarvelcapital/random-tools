const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();
const axios = require('axios');
const haversine = require('haversine-distance'); // Import haversine-distance

const postcodesIoUrl = process.env.POSTCODES_IO_URL;

/**
 * @swagger
 * /public/vendors:
 *   get:
 *     summary: Get all vendors
 *     tags: [Public]
 *     responses:
 *       200:
 *         description: A list of vendors
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
 *                   location:
 *                     type: string
 *                   openingTimes:
 *                     type: string
 *                   contactInfo:
 *                     type: string
 */
router.get('/vendors', async (req, res) => {
  try {
    const vendors = await prisma.vendor.findMany();
    res.json(vendors);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ error: 'Failed to fetch vendors. Please try again later.' });
  }
});

/**
 * @swagger
 * /public/vendor/{vendorId}:
 *   get:
 *     summary: Get vendor by ID
 *     tags: [Public]
 *     parameters:
 *       - in: path
 *         name: vendorId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A vendor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 location:
 *                   type: string
 *                 openingTimes:
 *                   type: string
 *                 contactInfo:
 *                   type: string
 */
router.get('/vendor/:vendorId', async (req, res) => {
  const { vendorId } = req.params;
  try {
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
    });
    if (vendor) {
      res.json(vendor);
    } else {
      res.status(404).json({ error: 'Vendor not found' });
    }
  } catch (error) {
    console.error(`Error fetching vendor with ID ${vendorId}:`, error);
    res.status(500).json({ error: 'Failed to fetch vendor. Please try again later.' });
  }
});

/**
 * @swagger
 * /public/vendor/{vendorId}/products:
 *   get:
 *     summary: Get products of a specific vendor
 *     tags: [Public]
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
    console.error(`Error fetching products for vendor ID ${vendorId}:`, error);
    res.status(500).json({ error: 'Failed to fetch products. Please try again later.' });
  }
});

/**
 * @swagger
 * /public/product/{productId}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Public]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A product
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 price:
 *                   type: number
 *                 stock:
 *                   type: integer
 */
router.get('/product/:productId', async (req, res) => {
  const { productId } = req.params;
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    console.error(`Error fetching product with ID ${productId}:`, error);
    res.status(500).json({ error: 'Failed to fetch product. Please try again later.' });
  }
});

/**
 * @swagger
 * /public/vendors/search:
 *   get:
 *     summary: Search vendors by location
 *     tags: [Public]
 *     parameters:
 *       - in: query
 *         name: postcode
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of vendors
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
 *                   location:
 *                     type: string
 *                   openingTimes:
 *                     type: string
 *                   contactInfo:
 *                     type: string
 */
router.get('/vendors/search', async (req, res) => {
  const { postcode } = req.query;
  try {
    const response = await axios.get(`${postcodesIoUrl}/${postcode}`);
    if (response.data.status !== 200) {
      return res.status(400).json({ error: 'Invalid postcode' });
    }
    const { latitude, longitude } = response.data.result;
    const vendors = await prisma.vendor.findMany();
    const filteredVendors = vendors.filter(vendor => {
      const distance = haversine(
        { lat: latitude, lon: longitude },
        { lat: vendor.latitude, lon: vendor.longitude }
      ) / 1609.34; // Convert meters to miles
      return distance <= 10; // Filter vendors within 10 miles
    });
    res.json(filteredVendors);
  } catch (error) {
    if (error.response && error.response.data) {
      console.error('Postcode lookup failed:', error.response.data);
      res.status(400).json({ error: 'Invalid postcode' });
    } else {
      console.error('Error searching vendors by location:', error);
      res.status(500).json({ error: 'Failed to search vendors. Please try again later.' });
    }
  }
});

/**
 * @swagger
 * /public/products/search:
 *   get:
 *     summary: Search products by keyword
 *     tags: [Public]
 *     parameters:
 *       - in: query
 *         name: keyword
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
router.get('/products/search', async (req, res) => {
  const { keyword } = req.query;
  try {
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { title: { contains: keyword } },
          { description: { contains: keyword } },
        ],
      },
    });
    res.json(products);
  } catch (error) {
    console.error('Error searching products by keyword:', error);
    res.status(500).json({ error: 'Failed to search products. Please try again later.' });
  }
});

module.exports = router;
