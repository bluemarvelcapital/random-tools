const { PrismaClient } = require('@prisma/client');
const shopifyService = require('../services/shopifyService');

const prismaClient = new PrismaClient().$extends({
  result: {
    product: {
      async $onCreate(product) {
        await shopifyService.syncProductToShopify(product);
        return product;
      },
      async $onUpdate(product) {
        await shopifyService.syncProductToShopify(product);
        return product;
      },
      async $onDelete(product) {
        await shopifyService.deleteProductFromShopify(product.shopifyId);
        return product;
      },
    },
  },
});

module.exports = prismaClient;
