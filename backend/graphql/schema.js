const { gql } = require('graphql-tag');

const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    password: String!
    role: String!
  }

  type Vendor {
    id: ID!
    name: String!
    email: String!
    userId: Int
    user: User
    products: [Product]
    orders: [Order]
  }

  type Product {
    id: ID!
    title: String!
    description: String!
    price: Float!
    stock: Int!
    vendorId: String!
  }

  type Order {
    id: ID!
    customerId: String!
    vendorId: String!
    date: String!
    total: Float!
    status: String!
  }

  type Query {
    vendors: [Vendor]
    vendor(id: ID!): Vendor
    products(vendorId: ID!, offset: Int, limit: Int): [Product]
    product(id: ID!): Product
  }

  type Mutation {
    registerUser(email: String!, password: String!): User
    registerVendor(email: String!, password: String!): User
    login(email: String!, password: String!): User
    createVendor(name: String!, email: String!): Vendor
    createProduct(vendorId: String!, title: String!, description: String!, price: Float!, stock: Int!): Product
    updateProduct(id: ID!, title: String, description: String, price: Float, stock: Int): Product
    deleteProduct(id: ID!): Product
  }
`;

module.exports = typeDefs;
