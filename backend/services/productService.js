const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


const getVendorProducts = async (vendorId) => {
  return await prisma.product.findMany({
    where: { vendorId },
  });
  
};

module.exports = {
  getVendorProducts,
};