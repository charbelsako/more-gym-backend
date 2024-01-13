const jwt = require('jsonwebtoken');
const { sendStatus } = require('../responseHandler');
const { statusCodes } = require('../constants.js');

async function verifyJWT(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.sendStatus(401);

    const token = authHeader.split(' ')[1];
    const decoded = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (verifyJWTError) {
    sendStatus(res, statusCodes.FORBIDDEN);
  }
}

module.exports = { verifyJWT };
