const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();

/**
 * @swagger
 * /api/v1/store/products:
 *   get:
 *     summary: Get products for storefront
 *     tags: [Storefront]
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
router.get('/products', async (req, res) => {
  const products = await prisma.product.findMany();
  res.send(products);
});

module.exports = router;
