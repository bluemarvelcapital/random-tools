const express = require('express');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const router = express.Router();

const users = []; // Replace with your actual user database

// Add an initial user for testing
const createInitialUser = async () => {
  const hashedPassword = await bcrypt.hash('password', 10);
  users.push({
    id: Date.now().toString(),
    email: 'test@example.com',
    password: hashedPassword
  });
  console.log('Initial user created:', users[0]); // Log initial user creation
};

// Call the function to create the initial user
createInitialUser();

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error('Error during authentication:', err);
      return next(err);
    }
    if (!user) {
      console.log('Authentication failed: User not found');
      console.log(user)
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

module.exports = router;
module.exports.users = users;
