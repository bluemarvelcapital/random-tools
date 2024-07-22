const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const users = require('../routes/auth').users; // Import users array from auth.js

passport.use(
  new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      console.log(`Attempting login for user: ${email}`);
      console.log('Current users:', users);
      const user = users.find(user => user.email.toLowerCase() === email.toLowerCase().trim());
      if (!user) {
        console.log('User not found:', email);
        return done(null, false, { message: 'User not found' });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Password incorrect' });
      }
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const user = users.find(user => user.id === id);
  done(null, user);
});

module.exports = passport;
