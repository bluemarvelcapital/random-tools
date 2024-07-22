const express = require('express');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const { ensureAuthenticated } = require('../middleware/auth'); // Import the middleware
const router = express.Router();

const users = []; // Replace with your actual user database

const createInitialUser = async () => {
  const hashedPassword = await bcrypt.hash('password', 10);
  users.push({
    id: Date.now().toString(),
    email: 'test@example.com',
    password: hashedPassword
  });
  console.log('Initial user created:', users[0]);
};

createInitialUser();

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error('Error during authentication:', err);
      return next(err);
    }
    if (!user) {
      console.log('Authentication failed: User not found');
      return res.status(401).send({ message: 'Invalid credentials' });
    }
    req.logIn(user, (err) => {
      if (err) {
        console.error('Error during login:', err);
        return next(err);
      }
      console.log('User authenticated:', user);
      return res.send(user);
    });
  })(req, res, next);
});

router.post('/register', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    users.push({
      id: Date.now().toString(),
      email: req.body.email,
      password: hashedPassword
    });
    console.log('User registered:', req.body.email);
    res.status(201).send({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

router.get('/logout', (req, res) => {
  req.logout(err => {
    if (err) {
      console.error('Error during logout:', err);
      return next(err);
    }
    res.send({ message: 'Logged out successfully' });
  });
});

// Protected route example
router.get('/protected-route', ensureAuthenticated, (req, res) => {
  res.send('This is a protected route');
});

router.get('/current-session', (req, res) => {
  if (req.isAuthenticated()) {
    res.send(req.user);
  } else {
    res.send(null);
  }
});

module.exports = router;
module.exports.users = users;
