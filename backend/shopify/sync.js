const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const SHOPIFY_API_URL = `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/2021-01`;
const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY;
const SHOPIFY_API_PASSWORD = process.env.SHOPIFY_API_PASSWORD;

const fetchProductsFromShopify = async () => {
  const response = await axios.get(`${SHOPIFY_API_URL}/products.json`, {
    auth: {
      username: SHOPIFY_API_KEY,
      password: SHOPIFY_API_PASSWORD,
    },
  });

  return response.data.products;
};

const fetchInventoryLevelsFromShopify = async () => {
  const response = await axios.get(`${SHOPIFY_API_URL}/inventory_levels.json`, {
    auth: {
      username: SHOPIFY_API_KEY,
      password: SHOPIFY_API_PASSWORD,
    },
  });

  return response.data.inventory_levels;
};

const syncProducts = async () => {
  const products = await fetchProductsFromShopify();

  for (const product of products) {
    const vendor = await prisma.vendor.upsert({
      where: { email: product.vendor },
      update: {},
      create: { name: product.vendor, email: product.vendor },
    });

    for (const variant of product.variants) {
      await prisma.product.upsert({
        where: { id: variant.id },
        update: {
          title: variant.title,
          description: product.body_html,
          price: parseFloat(variant.price),
          stock: variant.inventory_quantity,
          vendorId: vendor.id,
          shopifyId: variant.id,
        },
        create: {
          id: variant.id,
          title: variant.title,
          description: product.body_html,
          price: parseFloat(variant.price),
          stock: variant.inventory_quantity,
          vendorId: vendor.id,
          shopifyId: variant.id,
        },
      });
    }
  }

  console.log('Product synchronization complete.');
};

const syncInventory = async () => {
  const inventoryLevels = await fetchInventoryLevelsFromShopify();

  for (const level of inventoryLevels) {
    await prisma.product.updateMany({
      where: { shopifyId: level.inventory_item_id },
      data: { stock: level.available },
    });
  }

  console.log('Inventory synchronization complete.');
};

module.exports = {
  syncProducts,
  syncInventory,
};
