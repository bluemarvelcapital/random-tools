module.exports = {
    ensureAuthenticated: function(req, res, next) {
      if (req.isAuthenticated()) {
        return next();
      }
      res.status(401).send({ message: 'Please log in to view this resource' });
    }
  };
