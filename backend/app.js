require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const RedisStore = require('connect-redis').default;
const { createClient } = require('redis');

require('./config/passport-config')(passport); // Local strategy
require('./config/passport-jwt')(passport); // JWT strategy

const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const typeDefs = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');
const authRoutes = require('./routes/v1/auth');
const productRoutes = require('./routes/v1/products');
const vendorRoutes = require('./routes/v1/vendor');
const publicRoutes = require('./routes/v1/public');
const setupSwagger = require('./swagger');
const cors = require('cors');
const jwt = require('jsonwebtoken');

// Initialize default super admin
require('./config/user-init'); // This will run your user initialization script

const app = express();
const PORT = process.env.PORT || 5001;

// Redis client
const redisClient = createClient({
  url: process.env.REDIS_URL,
  legacyMode: true,
});

redisClient.connect().catch(console.error);

app.use(cors({
  origin: 'http://localhost:3000',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: false }
}));

app.use(passport.initialize());
app.use(passport.session());

setupSwagger(app);

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
});

async function startServer() {
  await server.start();
  app.use('/graphql', expressMiddleware(server));
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/products', passport.authenticate('jwt', { session: false }), productRoutes);
  app.use('/api/v1/vendor', passport.authenticate('jwt', { session: false }), vendorRoutes);
  app.use('/api/v1/public', publicRoutes);
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch(error => {
  console.error('Error starting server:', error);
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});
