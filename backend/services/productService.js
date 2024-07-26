const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const addProduct = async (productData) => {
  const { tags, images, ...rest } = productData;
  const tagsString = tags ? tags.join(', ') : '';
  return prisma.product.create({
    data: {
      ...rest,
      tags: tagsString,
      images: {
        create: images.map((url) => ({ url })),
      },
    },
    include: {
      images: true,
    },
  });
};

const getProductById = async (id) => {
  return prisma.product.findUnique({ 
    where: { id },
    include: { images: true },
  });
};

const updateProduct = async (productData) => {
  const { id, tags, images, ...rest } = productData;
  const tagsString = tags ? tags.join(', ') : '';

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...rest,
      tags: tagsString,
    },
    include: {
      images: true,
    },
  });

  // Update images
  if (images) {
    // Delete old images
    await prisma.image.deleteMany({ where: { productId: id } });
    // Add new images
    await prisma.image.createMany({
      data: images.map((url) => ({ url, productId: id })),
    });
  }

  return product;
};

const deleteProduct = async (id) => {
  return prisma.product.delete({ where: { id } });
};

const getProductsByVendorId = async (vendorId) => {
  return prisma.product.findMany({ 
    where: { vendorId },
    include: { images: true },
  });
};

const getOrdersByVendorId = async (vendorId) => {
  return prisma.order.findMany({ where: { vendorId } });
};

const updateOrderStatus = async (id, status) => {
  return prisma.order.update({
    where: { id },
    data: { status },
  });
};

const createDeletionRequest = async (vendorId, reason) => {
  return prisma.deletionRequest.create({
    data: { vendorId, reason },
  });
};

const getDeletionRequests = async (userId) => {
  return prisma.deletionRequest.findMany({
    where: { vendor: { userId } },
  });
};

module.exports = {
  addProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByVendorId,
  getOrdersByVendorId,
  updateOrderStatus,
  createDeletionRequest,
  getDeletionRequests,
};
