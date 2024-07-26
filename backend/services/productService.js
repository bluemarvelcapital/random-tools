const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const addProduct = async (productData) => {
  const { tags, images, vendorName, ...rest } = productData;
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: {
        ...rest,
        tags: tags, // Ensure tags are passed as an array
        vendorName: vendorName,
        images: {
          create: images.map((url) => ({ url })),
        },
      },
      include: {
        images: true,
      },
    });
    return product;
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

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...rest,
      tags: tags, // Ensure tags are passed as an array
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
