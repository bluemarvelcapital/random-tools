const { mergeResolvers } = require('@graphql-tools/merge');
const authResolvers = require('./authResolvers');
const vendorResolvers = require('./vendorResolvers');
const productsResolvers = require('./productsResolvers')

const resolvers = mergeResolvers([
  authResolvers,
  vendorResolvers,
  productsResolvers,
]);

module.exports = resolvers;
