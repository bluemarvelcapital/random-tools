const express = require('express');
const shopifyClient = require('../../shopify/shopifyClient');
const { createCheckout, addLineItems } = require('../../shopify/queries');
const router = express.Router();

/**
 * @swagger
 * /api/v1/shopify/checkout:
 *   post:
 *     summary: Create a new checkout
 *     tags: [Shopify]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               lineItems:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     variantId:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Checkout created successfully
 *       500:
 *         description: Internal Server Error
 */
router.post('/checkout', async (req, res) => {
  const { lineItems } = req.body;

  try {
    const data = await shopifyClient.fetchShopify(createCheckout, { input: { lineItems } });
    res.json(data.checkoutCreate.checkout);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/v1/shopify/checkout/{checkoutId}/line_items:
 *   post:
 *     summary: Add line items to an existing checkout
 *     tags: [Shopify]
 *     parameters:
 *       - in: path
 *         name: checkoutId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               lineItems:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     variantId:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Line items added successfully
 *       500:
 *         description: Internal Server Error
 */
router.post('/checkout/:checkoutId/line_items', async (req, res) => {
  const { checkoutId } = req.params;
  const { lineItems } = req.body;

  try {
    const data = await shopifyClient.fetchShopify(addLineItems, { checkoutId, lineItems });
    res.json(data.checkoutLineItemsAdd.checkout);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
