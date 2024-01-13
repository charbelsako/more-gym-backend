const allowedOrigins = ['http://localhost:3000'];

if (process.env.NODE_ENV) allowedOrigins.push('http://localhost:3000');

module.exports = allowedOrigins;
