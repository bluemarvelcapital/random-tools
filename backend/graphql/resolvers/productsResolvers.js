const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { ApolloError, UserInputError } = require('apollo-server-errors');

const productResolvers = {
  Query: {
    products: async (parent, args) => {
      const { vendorId, offset = 0, limit = 10 } = args;
      try {
        return await prisma.product.findMany({
          where: { vendorId },
          skip: offset,
          take: limit,
        });
      } catch (error) {
        console.error('Error fetching products:', error);
        throw new ApolloError('Error fetching products');
      }
    },
    product: async (parent, args) => {
      try {
        return await prisma.product.findUnique({ where: { id: args.id } });
      } catch (error) {
        console.error('Error fetching product:', error);
        throw new ApolloError('Error fetching product');
      }
    },
  },
  Mutation: {
    createProduct: async (parent, args, context) => {
      if (!context.user || context.user.role !== 'vendor') {
        throw new ApolloError('Not authorized');
      }
      const { vendorId, title, description, price, stock } = args;
      return await prisma.product.create({
        data: {
          title,
          description,
          price,
          stock,
          vendor: { connect: { id: vendorId } },
        },
      });
    },
    updateProduct: async (parent, args, context) => {
      if (!context.user || context.user.role !== 'vendor') {
        throw new ApolloError('Not authorized');
      }

      const product = await prisma.product.findUnique({ where: { id: args.id } });
      if (!product) {
        throw new UserInputError('Product not found');
      }

      // Check if the product belongs to the current user
      if (product.vendorId !== context.user.id) {
        throw new ApolloError('Not authorized to update this product');
      }

      const { id, title, description, price, stock } = args;
      return await prisma.product.update({
        where: { id },
        data: { title, description, price, stock },
      });
    },
    deleteProduct: async (parent, args, context) => {
      if (!context.user || context.user.role !== 'vendor') {
        throw new ApolloError('Not authorized');
      }

      const product = await prisma.product.findUnique({ where: { id: args.id } });
      if (!product) {
        throw new UserInputError('Product not found');
      }

      // Check if the product belongs to the current user
      if (product.vendorId !== context.user.id) {
        throw new ApolloError('Not authorized to delete this product');
      }

      const { id } = args;
      return await prisma.product.delete({
        where: { id },
      });
    },
  },
};

module.exports = productResolvers;
