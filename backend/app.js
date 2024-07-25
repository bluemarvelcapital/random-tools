require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('./config/passport-config'); // Local strategy
const jwtPassport = require('./config/passport-jwt'); // JWT strategy
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const typeDefs = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');
const authRoutesV1 = require('./routes/v1/auth');
const vendorRoutesV1 = require('./routes/v1/vendor');
const storefrontRoutesV1 = require('./routes/v1/storeFront');
const shopifyRoutesV1 = require('./routes/v1/shopify');
const userRoutesV1 = require('./routes/v1/user');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { checkRole, checkRoles } = require('./middleware/roleMiddleware');
const setupSwagger = require('./swagger'); // Import Swagger setup

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
  origin: 'http://localhost:3000',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: false }
}));

app.use(passport.initialize());
app.use(passport.session());

setupSwagger(app); // Set up Swagger

const server = new ApolloServer({
  schema: makeExecutableSchema({
    typeDefs,
    resolvers,
  }),
  context: ({ req }) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return { user: decoded };
      } catch (error) {
        console.error('JWT verification failed:', error);
      }
    }
    return { user: null };
  },
  introspection: process.env.NODE_ENV === 'development', // Enable introspection in development mode
  playground: process.env.NODE_ENV === 'development', // Enable GraphQL Playground in development mode
});

async function startServer() {
  await server.start();
  app.use('/graphql', expressMiddleware(server));
  app.use('/api/v1/auth', authRoutesV1);
  app.use('/api/v1/vendor', passport.authenticate('jwt', { session: false }), checkRole('vendor'), vendorRoutesV1); // Vendor management routes
  app.use('/api/v1/store', storefrontRoutesV1); // Storefront routes
  app.use('/api/v1/shopify', shopifyRoutesV1); // Shopify routes
  app.use('/api/v1/user', userRoutesV1); // User routes
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch(error => {
  console.error('Error starting server:', error);
});
