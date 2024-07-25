const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { ApolloError } = require('apollo-server-errors');

const authResolvers = {
  Mutation: {
    registerUser: async (parent, args) => {
      const existingUser = await prisma.user.findUnique({ where: { email: args.email } });
      if (existingUser) {
        throw new ApolloError('Email already registered.');
      }

      const hashedPassword = await bcrypt.hash(args.password, 10);
      const user = await prisma.user.create({
        data: {
          email: args.email,
          password: hashedPassword,
          role: 'user',
        },
      });
      return user;
    },
    registerVendor: async (parent, args) => {
      const existingUser = await prisma.user.findUnique({ where: { email: args.email } });
      if (existingUser) {
        throw new ApolloError('Email already registered.');
      }

      const hashedPassword = await bcrypt.hash(args.password, 10);
      const user = await prisma.user.create({
        data: {
          email: args.email,
          password: hashedPassword,
          role: 'vendor',
        },
      });
      return user;
    },
    login: async (parent, args) => {
      const user = await prisma.user.findUnique({ where: { email: args.email } });
      if (!user) {
        throw new ApolloError('User not found');
      }
      const isMatch = await bcrypt.compare(args.password, user.password);
      if (!isMatch) {
        throw new ApolloError('Incorrect password');
      }
      return user;
    },
  },
};

module.exports = authResolvers;
