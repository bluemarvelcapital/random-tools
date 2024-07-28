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
    variant: {
      async $onCreate(variant) {
        const product = await prismaClient.product.findUnique({ where: { id: variant.productId } });
        await shopifyService.syncProductToShopify(product);
        return variant;
      },
      async $onUpdate(variant) {
        const product = await prismaClient.product.findUnique({ where: { id: variant.productId } });
        await shopifyService.syncProductToShopify(product);
        return variant;
      },
      async $onDelete(variant) {
        const product = await prismaClient.product.findUnique({ where: { id: variant.productId } });
        await shopifyService.syncProductToShopify(product);
        return variant;
      },
    },
  },
});

module.exports = prismaClient;
