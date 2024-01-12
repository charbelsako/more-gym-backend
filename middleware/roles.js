function isAdmin(req, res, next) {
  if (req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Forbidden: You are not an admin' });
}

function isTrainer(req, res, next) {
  if (req.user.role === 'trainer') {
    return next();
  }
  return res.status(403).json({ message: 'Forbidden: You are not a trainer' });
}

function isCustomer(req, res, next) {
  if (req.user.role === 'customer') {
    return next();
  }
  return res.status(403).json({ message: 'Forbidden: You are not a trainer' });
}

module.exports = { isCustomer, isTrainer, isAdmin };
