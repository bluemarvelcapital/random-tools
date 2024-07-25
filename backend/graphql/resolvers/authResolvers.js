const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const { AuthenticationError } = require('apollo-server-express');

const authResolvers = {
  Mutation: {
    register: async (parent, args) => {
      const existingUser = await prisma.user.findUnique({ where: { email: args.email } });
      if (existingUser) {
        throw new Error('Email already registered.');
      }

      const hashedPassword = await bcrypt.hash(args.password, 10);
      const user = await prisma.user.create({
        data: {
          email: args.email,
          password: hashedPassword,
        },
      });
      return user;
    },
    login: async (parent, args) => {
      const user = await prisma.user.findUnique({ where: { email: args.email } });
      if (!user) {
        throw new AuthenticationError('User not found');
      }
      const isMatch = await bcrypt.compare(args.password, user.password);
      if (!isMatch) {
        throw new AuthenticationError('Incorrect password');
      }
      const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });
      return { token };
    },
  },
};

module.exports = authResolvers;
