const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const { AuthenticationError } = require('apollo-server-express');
const { v4: uuidv4 } = require('uuid');

const authResolvers = {
  Mutation: {
    register: async (parent, args) => {
      try {
        const existingUser = await prisma.user.findUnique({ where: { email: args.email } });
        if (existingUser) {
          throw new Error('Email already registered.');
        }

        const hashedPassword = await bcrypt.hash(args.password, 10);
        const user = await prisma.user.create({
          data: {
            id: uuidv4(), // Generate UUID for user ID
            email: args.email,
            password: hashedPassword,
          },
        });
        return user;
      } catch (error) {
        console.error('Error during user registration:', error);
        throw new Error('Failed to register user. Please try again.');
      }
    },
    login: async (parent, args) => {
      try {
        const user = await prisma.user.findUnique({ where: { email: args.email } });
        if (!user) {
          throw new AuthenticationError('User not found');
        }
        const isMatch = await bcrypt.compare(args.password, user.password);
        if (!isMatch) {
          throw new AuthenticationError('Incorrect password - not in use');
        }
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });
        return { token };
      } catch (error) {
        console.error('Error during user login:', error);
        throw new Error('Failed to login user. Please try again.');
      }
    },
  },
};

module.exports = authResolvers;
