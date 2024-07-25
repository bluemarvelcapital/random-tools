const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    role: String!
  }

  type Vendor {
    id: ID!
    name: String!
    email: String!
    latitude: Float
    longitude: Float
    location: String
    openingTimes: String
    contactInfo: String
    products: [Product!]!
    orders: [Order!]!
  }

  type Product {
    id: ID!
    title: String!
    description: String!
    price: Float!
    stock: Int!
    vendorId: ID!
    vendor: Vendor!
  }

  type Order {
    id: ID!
    customerId: ID!
    vendorId: ID!
    date: String!
    total: Float!
    status: String!
    customer: Customer!
    vendor: Vendor!
  }

  type Customer {
    id: ID!
    name: String!
    email: String!
    orders: [Order!]!
  }

  type Query {
    vendors: [Vendor!]!
    vendor(id: ID!): Vendor
    products(vendorId: ID!): [Product!]!
    product(id: ID!): Product
    orders(vendorId: ID!): [Order!]!
    order(id: ID!): Order
  }

  type Mutation {
    register(email: String!, password: String!): User!
    login(email: String!, password: String!): String! # returns a JWT token
    createVendor(name: String!, email: String!, postcode: String!, location: String, openingTimes: String, contactInfo: String): Vendor!
    updateVendor(id: ID!, name: String, email: String, postcode: String, location: String, openingTimes: String, contactInfo: String): Vendor!
    deleteVendor(id: ID!): Boolean!
    createProduct(title: String!, description: String!, price: Float!, stock: Int!, vendorId: ID!): Product!
    updateProduct(id: ID!, title: String, description: String, price: Float, stock: Int): Product!
    deleteProduct(id: ID!): Boolean!
    updateOrderStatus(id: ID!, status: String!): Order!
  }
`;

module.exports = typeDefs;
