const express = require('express');
const { verifyJWT } = require('../../middleware/verifyJWT');
const {
  handleLogin,
  handleLogout,
  handleRefreshToken,
} = require('./authController');

const router = express.Router();

/**
 * @route /api/v1/auth/login
 * @desc logs a user in and creates tokens
 * @access public
 * @method POST
 */
router.post('/login', handleLogin);

/**
 * @route /api/v1/auth/login
 * @desc logs a user in and creates tokens
 * @access public
 * @method POST
 */
router.get('/refresh', handleRefreshToken);

/**
 * @route /api/v1/auth/logout
 * @desc logs a user out and removes cookie and refresh token
 * @access public
 * @method POST
 */
router.get('/logout', handleLogout);

/**
 * just for testing that protection works with role
 */
router.use(verifyJWT);
router.get('/protected', (req, res) => {
  res.send('working');
});

module.exports = router;
