const allowedOrigins = ['http://localhost:3000', 'http://192.236.178.57:5000'];

if (process.env.NODE_ENV) allowedOrigins.push('http://localhost:3000');

module.exports = allowedOrigins;
