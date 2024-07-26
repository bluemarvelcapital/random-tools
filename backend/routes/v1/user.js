const express = require('express');
const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const router = express.Router();
const prisma = new PrismaClient();
const haversine = require('haversine-distance');
const { SHOPIFY_API_URL, SHOPIFY_ACCESS_TOKEN } = process.env;

/**
 * @swagger
 * /user/vendors/nearby:
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
 *         description: Vendors fetched successfully
 */
router.get('/vendors/nearby', async (req, res) => {
  const { postcode, radius } = req.query;
  try {
    const response = await axios.get(`${process.env.POSTCODES_IO_URL}/${postcode}`);
    if (response.data.status !== 200) {
      return res.status(404).json({ error: 'Invalid postcode' });
    }
    const { latitude, longitude } = response.data.result;
    const vendors = await prisma.vendor.findMany();
    const nearbyVendors = vendors.filter(vendor => {
      const distance = haversine(
        { lat: latitude, lon: longitude },
        { lat: vendor.latitude, lon: vendor.longitude }
      );
      return distance <= radius * 1609.34; // Convert miles to meters
    });
    res.json(nearbyVendors);
  } catch (error) {
    console.error('Error fetching nearby vendors:', error);
    res.status(500).json({ error: 'Failed to fetch nearby vendors. Please try again later.' });
  }
});

/**
 * @swagger
 * /user/vendor/{vendorId}/products:
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
 *         description: Products fetched successfully
 */
router.get('/vendor/:vendorId/products', async (req, res) => {
  const { vendorId } = req.params;
  try {
    const products = await prisma.product.findMany({ where: { vendorId } });
    res.json(products);
  } catch (error) {
    console.error(`Error fetching products for vendor ID ${vendorId}:`, error);
    res.status(500).json({ error: 'Failed to fetch products. Please try again later.' });
  }
});

/**
 * @swagger
 * /user/vendor/{id}:
 *   get:
 *     summary: Get vendor details
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vendor details fetched successfully
 */
router.get('/vendor/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const vendor = await prisma.vendor.findUnique({ where: { id } });
    if (vendor) {
      res.json(vendor);
    } else {
      res.status(404).json({ error: 'Vendor not found' });
    }
  } catch (error) {
    console.error(`Error fetching vendor with ID ${id}:`, error);
    res.status(500).json({ error: 'Failed to fetch vendor. Please try again later.' });
  }
});

/**
 * @swagger
 * /user/products/search:
 *   get:
 *     summary: Search for products by keyword
 *     tags: [User]
 *     parameters:
 *       - in: query
 *         name: keyword
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Products fetched successfully
 */
router.get('/products/search', async (req, res) => {
  const { keyword } = req.query;
  try {
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { title: { contains: keyword, mode: 'insensitive' } },
          { description: { contains: keyword, mode: 'insensitive' } }
        ]
      }
    });
    res.json(products);
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ error: 'Failed to search products. Please try again later.' });
  }
});

/**
 * @swagger
 * /user/product/{id}:
 *   get:
 *     summary: Get product details
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product details fetched successfully
 */
router.get('/product/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const product = await prisma.product.findUnique({ where: { id } });
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error);
    res.status(500).json({ error: 'Failed to fetch product. Please try again later.' });
  }
});

/**
 * @swagger
 * /user/cart/add:
 *   post:
 *     summary: Add a product to the cart
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Product added to cart successfully
 */
router.post('/cart/add', async (req, res) => {
  const { productId, quantity } = req.body;
  try {
    // Assuming you have a cart model in your schema
    const cartItem = await prisma.cart.create({
      data: {
        productId,
        quantity,
        userId: req.user.id, // Assuming user is authenticated
      },
    });
    res.status(200).json({ message: 'Product added to cart successfully', cartItem });
  } catch (error) {
    console.error('Error adding product to cart:', error);
    res.status(500).json({ error: 'Failed to add product to cart. Please try again later.' });
  }
});

/**
 * @swagger
 * /user/cart:
 *   get:
 *     summary: View cart items
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Cart items fetched successfully
 */
router.get('/cart', async (req, res) => {
  try {
    // Assuming you have a cart model in your schema
    const cartItems = await prisma.cart.findMany({ where: { userId: req.user.id } });
    res.json(cartItems);
  } catch (error) {
    console.error('Error fetching cart items:', error);
    res.status(500).json({ error: 'Failed to fetch cart items. Please try again later.' });
  }
});

/**
 * @swagger
 * /user/cart/remove:
 *   delete:
 *     summary: Remove a product from the cart
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Product removed from cart successfully
 */
router.delete('/cart/remove', async (req, res) => {
  const { productId } = req.body;
  try {
    await prisma.cart.delete({
      where: {
        productId_userId: {
          productId,
          userId: req.user.id, // Assuming user is authenticated
        },
      },
    });
    res.status(200).json({ message: 'Product removed from cart successfully' });
  } catch (error) {
    console.error('Error removing product from cart:', error);
    res.status(500).json({ error: 'Failed to remove product from cart. Please try again later.' });
  }
});

/**
 * @swagger
 * /user/checkout:
 *   post:
 *     summary: Checkout and place an order
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               address:
 *                 type: string
 *               paymentMethod:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order placed successfully
 */
router.post('/checkout', async (req, res) => {
  const { address, paymentMethod } = req.body;
  try {
    const cartItems = await prisma.cart.findMany({ where: { userId: req.user.id } });
    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }
    // Create an order in Shopify
    const shopifyOrder = await axios.post(
      `${SHOPIFY_API_URL}/orders.json`,
      {
        order: {
          line_items: cartItems.map(item => ({
            variant_id: item.shopifyVariantId,
            quantity: item.quantity,
          })),
          shipping_address: {
            address1: address,
          },
          financial_status: 'paid',
        },
      },
      {
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
      }
    );

    // Save order details in local database
    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        address,
        paymentMethod,
        total: cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
        status: 'pending',
        shopifyId: shopifyOrder.data.order.id,
        items: {
          create: cartItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
    });

    await prisma.cart.deleteMany({ where: { userId: req.user.id } });

    res.status(200).json({ message: 'Order placed successfully', order });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ error: 'Failed to place order. Please try again later.' });
  }
});

/**
 * @swagger
 * /user/orders:
 *   get:
 *     summary: View past orders
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Orders fetched successfully
 */
router.get('/orders', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({ where: { userId: req.user.id } });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders. Please try again later.' });
  }
});

/**
 * @swagger
 * /user/order/{id}:
 *   get:
 *     summary: View order details
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details fetched successfully
 */
router.get('/order/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const order = await prisma.order.findUnique({ where: { id } });
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ error: 'Order not found' });
    }
  } catch (error) {
    console.error(`Error fetching order with ID ${id}:`, error);
    res.status(500).json({ error: 'Failed to fetch order. Please try again later.' });
  }
});

module.exports = router;
