const express = require('express');
const router = express.Router();
const { getVendorProducts } = require('../../services/productService');

router.get('/', async (req, res) => {
  const { vendorId } = req.query;
  try {
    console.log(vendorId)
    const products = await getVendorProducts(vendorId);
    res.json(products);
    console.log(products)
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).send('Server error');
  }
});

module.exports = router;