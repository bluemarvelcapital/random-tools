const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const { users } = require('../routes/auth');

passport.use(new LocalStrategy({
  usernameField: 'email'
}, (email, password, done) => {
  const user = users.find(user => user.email === email);
  if (!user) {
    return done(null, false, { message: 'Incorrect email.' });
  }
  bcrypt.compare(password, user.password, (err, isMatch) => {
    if (err) throw err;
    if (isMatch) {
      return done(null, user);
    } else {
      return done(null, false, { message: 'Incorrect password.' });
    }
  });
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const user = users.find(user => user.id === id);
  if (user) {
    done(null, user);
  } else {
    done(new Error('User not found'));
  }
});

module.exports = passport;
