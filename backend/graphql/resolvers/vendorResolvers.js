const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { ApolloError, UserInputError } = require('apollo-server-errors');

const vendorResolvers = {
  Query: {
    vendors: async () => {
      try {
        return await prisma.vendor.findMany();
      } catch (error) {
        console.error('Error fetching vendors:', error);
        throw new ApolloError('Error fetching vendors');
      }
    },
    vendor: async (parent, args) => {
      try {
        return await prisma.vendor.findUnique({ where: { id: args.id } });
      } catch (error) {
        console.error('Error fetching vendor:', error);
        throw new ApolloError('Error fetching vendor');
      }
    },
  },
  Mutation: {
    createVendor: async (parent, args, context) => {
      if (!context.user) {
        throw new ApolloError('Not authenticated');
      }

      // Check if the email is already registered as a vendor
      const existingVendor = await prisma.vendor.findUnique({ where: { email: args.email } });
      if (existingVendor) {
        throw new ApolloError('Vendor email already registered.');
      }

      const vendor = await prisma.vendor.create({
        data: {
          name: args.name,
          email: args.email,
          userId: context.user.id,
        },
      });

      return vendor;
    },
  },
};

module.exports = vendorResolvers;
