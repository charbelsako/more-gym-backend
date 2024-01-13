const allowedOrigins = require('../config/allowedOrigins');

const credentials = (req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    // this was changed to true
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  next();
};

module.exports = credentials;
