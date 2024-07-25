const { ApolloError } = require('apollo-server-errors');

const checkRole = (role) => {
  return (req, res, next) => {
    if (req.user && req.user.role === role) {
      next();
    } else {
      res.status(403).json({ message: 'Access forbidden: insufficient rights' });
    }
  };
};

const checkRoles = (roles) => {
  return (req, res, next) => {
    if (req.user && roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ message: 'Access forbidden: insufficient rights' });
    }
  };
};

module.exports = { checkRole, checkRoles };
