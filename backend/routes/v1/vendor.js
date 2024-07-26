const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../../middleware/auth');
const vendorService = require('../../services/vendorService');
const productService = require('../../services/productService');
const shopifyService = require('../../services/shopifyService');

/**
 * @swagger
 * /vendor/register:
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
 *       200:
 *         description: Vendor registered successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Failed to register vendor
 */
router.post('/register', ensureAuthenticated, async (req, res) => {
  const { name, email, postcode, location, openingTimes, contactInfo } = req.body;

  try {
    const vendor = await vendorService.registerVendor(req.user.id, req.body);
    res.status(200).json({ message: 'Vendor registered successfully', vendor });
  } catch (error) {
    console.error('Error registering vendor:', error);
    res.status(400).json({ error: error.message });
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
 *         description: Vendor profile updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Vendor not found
 *       500:
 *         description: Failed to update vendor profile
 */
router.put('/update', ensureAuthenticated, async (req, res) => {
  try {
    const updatedVendor = await vendorService.updateVendor(req.body);
    res.status(200).json({ message: 'Vendor profile updated successfully', updatedVendor });
  } catch (error) {
    console.error('Error updating vendor profile:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/v1/vendor/{id}:
 *   get:
 *     summary: Get vendor details
 *     tags: [Vendor]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vendor details fetched successfully
 *       404:
 *         description: Vendor not found
 *       500:
 *         description: Failed to fetch vendor
 */
router.get('/:id', async (req, res) => {
  try {
    const vendor = await vendorService.getVendorById(req.params.id);
    if (vendor) {
      res.json(vendor);
    } else {
      res.status(404).json({ error: 'Vendor not found' });
    }
  } catch (error) {
    console.error(`Error fetching vendor with ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch vendor. Please try again later.' });
  }
});

/**
 * @swagger
 * /api/v1/vendor:
 *   get:
 *     summary: Get all vendors
 *     tags: [Vendor]
 *     responses:
 *       200:
 *         description: Vendors fetched successfully
 *       500:
 *         description: Failed to fetch vendors
 */
router.get('/', async (req, res) => {
  try {
    const vendors = await vendorService.getAllVendors();
    res.json(vendors);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ error: 'Failed to fetch vendors. Please try again later.' });
  }
});

/**
 * @swagger
 * /api/v1/vendor/product/add:
 *   post:
 *     summary: Add a new product
 *     tags: [Vendor]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               vendorId:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               sku:
 *                 type: string
 *               barcode:
 *                 type: string
 *               weight:
 *                 type: number
 *               weightUnit:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               productType:
 *                 type: string
 *               status:
 *                 type: string
 *               inventoryPolicy:
 *                 type: string
 *               fulfillmentService:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Product added successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Failed to add product
 */
router.post('/product/add', ensureAuthenticated, async (req, res) => {
  try {
    const shopifyProduct = await shopifyService.addProductToShopify(req.body);
    const productData = { ...req.body, shopifyId: shopifyProduct.id.toString() };
    const product = await productService.addProduct(productData);
    res.status(200).json({ message: 'Product added successfully', product });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(400).json({ error: error.message });
  }
});


/**
 * @swagger
 * /api/v1/vendor/product/update:
 *   put:
 *     summary: Update a product
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               sku:
 *                 type: string
 *               barcode:
 *                 type: string
 *               weight:
 *                 type: number
 *               weightUnit:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               productType:
 *                 type: string
 *               status:
 *                 type: string
 *               inventoryPolicy:
 *                 type: string
 *               fulfillmentService:
 *                 type: string
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Product not found
 *       500:
 *         description: Failed to update product
 */
router.put('/product/update', ensureAuthenticated, async (req, res) => {
  try {
    const product = await productService.getProductById(req.body.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await shopifyService.updateProductInShopify(product.shopifyId, req.body);
    const updatedProduct = await productService.updateProduct(req.body);
    res.status(200).json({ message: 'Product updated successfully', updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/v1/vendor/product/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Vendor]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 *       500:
 *         description: Failed to delete product
 */
router.delete('/product/:id', ensureAuthenticated, async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await shopifyService.deleteProductFromShopify(product.shopifyId);
    await productService.deleteProduct(req.params.id);
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(`Error deleting product with ID ${req.params.id}:`, error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/v1/vendor/{vendorId}/products:
 *   get:
 *     summary: Get all products of a vendor
 *     tags: [Vendor]
 *     parameters:
 *       - in: path
 *         name: vendorId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Products fetched successfully
 *       500:
 *         description: Failed to fetch products
 */
router.get('/:vendorId/products', async (req, res) => {
  try {
    const products = await productService.getProductsByVendorId(req.params.vendorId);
    res.json(products);
  } catch (error) {
    console.error(`Error fetching products for vendor ID ${req.params.vendorId}:`, error);
    res.status(500).json({ error: 'Failed to fetch products. Please try again later.' });
  }
});

/**
 * @swagger
 * /api/v1/vendor/orders:
 *   get:
 *     summary: Get all orders for a vendor
 *     tags: [Vendor]
 *     responses:
 *       200:
 *         description: Orders fetched successfully
 *       500:
 *         description: Failed to fetch orders
 */
router.get('/orders', ensureAuthenticated, async (req, res) => {
  try {
    const orders = await productService.getOrdersByVendorId(req.user.id);
    res.json(orders);
  } catch (error) {
    console.error(`Error fetching orders for vendor ID ${req.user.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch orders. Please try again later.' });
  }
});

/**
 * @swagger
 * /api/v1/vendor/order/update:
 *   put:
 *     summary: Update order status
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
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Failed to update order status
 */
router.put('/order/update', ensureAuthenticated, async (req, res) => {
  const { id, status } = req.body;
  try {
    const updatedOrder = await productService.updateOrderStatus(id, status);
    res.status(200).json({ message: 'Order status updated successfully', updatedOrder });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/v1/vendor/deletion-request:
 *   post:
 *     summary: Create a deletion request
 *     tags: [Vendor]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               vendorId:
 *                 type: string
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Deletion request created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Failed to create deletion request
 */
router.post('/deletion-request', ensureAuthenticated, async (req, res) => {
  const { vendorId, reason } = req.body;
  try {
    const request = await productService.createDeletionRequest(vendorId, reason);
    res.status(200).json({ message: 'Deletion request created successfully', request });
  } catch (error) {
    console.error('Error creating deletion request:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/v1/vendor/deletion-requests:
 *   get:
 *     summary: Get all deletion requests for the authenticated vendor
 *     tags: [Vendor]
 *     responses:
 *       200:
 *         description: Deletion requests fetched successfully
 *       500:
 *         description: Failed to fetch deletion requests
 */
router.get('/deletion-requests', ensureAuthenticated, async (req, res) => {
  try {
    const requests = await productService.getDeletionRequests(req.user.id);
    res.status(200).json(requests);
  } catch (error) {
    console.error('Error fetching deletion requests:', error);
    res.status(500).json({ error: 'Failed to fetch deletion requests. Please try again later.' });
  }
});

module.exports = router;
