const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { ensureAuthenticated } = require('../../middleware/auth');
const router = express.Router();

/**
 * @swagger
 * /api/v1/vendor/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Vendor]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               vendorId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Product created successfully
 *       500:
 *         description: Internal Server Error
 */
router.post('/products', ensureAuthenticated, async (req, res) => {
  const { title, description, price, stock, vendorId } = req.body;
  const product = await prisma.product.create({
    data: {
      title,
      description,
      price,
      stock,
      vendor: { connect: { id: vendorId } },
    },
  });
  res.send(product);
});

/**
 * @swagger
 * /api/v1/vendor/products/{id}:
 *   put:
 *     summary: Update an existing product
 *     tags: [Vendor]
 *     parameters:
 *       - in: path
 *         name: id
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       500:
 *         description: Internal Server Error
 */
router.put('/products/:id', ensureAuthenticated, async (req, res) => {
  const { id } = req.params;
  const { title, description, price, stock } = req.body;
  const product = await prisma.product.update({
    where: { id },
    data: { title, description, price, stock },
  });
  res.send(product);
});

/**
 * @swagger
 * /api/v1/vendor/products/{id}:
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
 *       500:
 *         description: Internal Server Error
 */
router.delete('/products/:id', ensureAuthenticated, async (req, res) => {
  const { id } = req.params;
  await prisma.product.delete({ where: { id } });
  res.send({ message: 'Product deleted' });
});

module.exports = router;
