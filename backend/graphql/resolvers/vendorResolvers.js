const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { ApolloError } = require('apollo-server-errors');
const axios = require('axios');

const postcodesIoUrl = process.env.POSTCODES_IO_URL;

const vendorResolvers = {
  Query: {
    vendors: async () => await prisma.vendor.findMany(),
    vendor: async (parent, args) => await prisma.vendor.findUnique({ where: { id: args.id } }),
    products: async (parent, args) => await prisma.product.findMany({ where: { vendorId: args.vendorId } }),
    product: async (parent, args) => await prisma.product.findUnique({ where: { id: args.id } }),
    orders: async (parent, args) => await prisma.order.findMany({ where: { vendorId: args.vendorId } }),
    order: async (parent, args) => await prisma.order.findUnique({ where: { id: args.id } }),
  },
  Mutation: {
    createVendor: async (parent, args, context) => {
      if (!context.user) {
        throw new ApolloError('Not authenticated');
      }

      const existingVendor = await prisma.vendor.findUnique({ where: { email: args.email } });
      if (existingVendor) {
        throw new ApolloError('Vendor email already registered.');
      }

      const response = await axios.get(`${postcodesIoUrl}/${args.postcode}`);
      if (response.data.status !== 200) {
        throw new ApolloError('Invalid postcode');
      }

      const vendor = await prisma.vendor.create({
        data: {
          name: args.name,
          email: args.email,
          latitude: response.data.result.latitude,
          longitude: response.data.result.longitude,
          location: args.location,
          openingTimes: args.openingTimes,
          contactInfo: args.contactInfo,
          userId: context.user.id,
        },
      });

      return vendor;
    },
    updateVendor: async (parent, args, context) => {
      if (!context.user) {
        throw new ApolloError('Not authenticated');
      }

      const data = {};
      if (args.name) data.name = args.name;
      if (args.email) {
        const existingVendor = await prisma.vendor.findUnique({ where: { email: args.email } });
        if (existingVendor && existingVendor.id !== args.id) {
          throw new ApolloError('Email already in use.');
        }
        data.email = args.email;
      }
      if (args.postcode) {
        const response = await axios.get(`${postcodesIoUrl}/${args.postcode}`);
        if (response.data.status !== 200) {
          throw new ApolloError('Invalid postcode');
        }
        data.latitude = response.data.result.latitude;
        data.longitude = response.data.result.longitude;
      }
      if (args.location) data.location = args.location;
      if (args.openingTimes) data.openingTimes = args.openingTimes;
      if (args.contactInfo) data.contactInfo = args.contactInfo;

      const vendor = await prisma.vendor.update({
        where: { id: args.id },
        data,
      });

      return vendor;
    },
    deleteVendor: async (parent, args, context) => {
      if (!context.user) {
        throw new ApolloError('Not authenticated');
      }

      await prisma.vendor.delete({ where: { id: args.id } });
      return true;
    },
    createProduct: async (parent, args, context) => {
      if (!context.user) {
        throw new ApolloError('Not authenticated');
      }

      const product = await prisma.product.create({
        data: {
          title: args.title,
          description: args.description,
          price: args.price,
          stock: args.stock,
          vendorId: args.vendorId,
        },
      });

      return product;
    },
    updateProduct: async (parent, args, context) => {
      if (!context.user) {
        throw new ApolloError('Not authenticated');
      }

      const data = {};
      if (args.title) data.title = args.title;
      if (args.description) data.description = args.description;
      if (args.price) data.price = args.price;
      if (args.stock) data.stock = args.stock;

      const product = await prisma.product.update({
        where: { id: args.id },
        data,
      });

      return product;
    },
    deleteProduct: async (parent, args, context) => {
      if (!context.user) {
        throw new ApolloError('Not authenticated');
      }

      await prisma.product.delete({ where: { id: args.id } });
      return true;
    },
    updateOrderStatus: async (parent, args, context) => {
      if (!context.user) {
        throw new ApolloError('Not authenticated');
      }

      const order = await prisma.order.update({
        where: { id: args.id },
        data: { status: args.status },
      });

      return order;
    },
  },
};

module.exports = vendorResolvers;
