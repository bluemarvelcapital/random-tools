const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const addProduct = async (productData) => {
  const { tags, images, variants, vendorName, shopifyId, ...rest } = productData; // Extract vendorName and shopifyId
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: {
        ...rest,
        shopifyId, // Ensure shopifyId is included
        tags: tags, // Ensure tags are passed as an array
        images: {
          create: images.map((url) => ({ url })),
        },
        variants: {
          create: variants.map(variant => ({
            option1: variant.option1,
            price: variant.price,
            compareAtPrice: variant.compareAtPrice,
            stock: variant.stock,
            weight: variant.weight,
            weightUnit: variant.weightUnit,
          })),
        },
      },
      include: {
        images: true,
        variants: true, // Include variants to fetch the created variants
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

const deleteProductRelations = async (productId) => {
  await prisma.image.deleteMany({ where: { productId } });
  await prisma.variant.deleteMany({ where: { productId } });
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
  deleteProductRelations,
  getProductsByVendorId,
  getOrdersByVendorId,
  updateOrderStatus,
  createDeletionRequest,
  getDeletionRequests,
};
