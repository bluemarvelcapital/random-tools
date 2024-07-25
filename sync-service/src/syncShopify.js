const axios = require('axios');
const prisma = require('../prisma');

const fetchShopifyProducts = async (sinceId) => {
  const url = `https://${process.env.SHOPIFY_API_KEY}:${process.env.SHOPIFY_PASSWORD}@${process.env.SHOPIFY_STORE_URL}/admin/api/2021-07/products.json?limit=250`;
  const response = await axios.get(url);
  return response.data.products;
};

const syncShopifyData = async () => {
  let lastProductId = null;

  try {
    const latestProduct = await prisma.product.findFirst({ orderBy: { shopifyId: 'desc' } });
    if (latestProduct) lastProductId = latestProduct.shopifyId;

    const products = await fetchShopifyProducts(lastProductId);
    for (const product of products) {
      await prisma.product.upsert({
        where: { shopifyId: product.id.toString() },
        update: {
          title: product.title,
          description: product.body_html,
          price: parseFloat(product.variants[0].price),
          stock: product.variants[0].inventory_quantity
        },
        create: {
          shopifyId: product.id.toString(),
          title: product.title,
          description: product.body_html,
          price: parseFloat(product.variants[0].price),
          stock: product.variants[0].inventory_quantity,
          vendorId: 'vendor-id-here' // Update this to dynamically map vendors
        }
      });
    }

    console.log('Shopify data sync completed.');
  } catch (error) {
    console.error('Error during Shopify data sync:', error);
  }
};

module.exports = syncShopifyData;
