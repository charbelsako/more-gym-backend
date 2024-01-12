// create trainer route a trainer is a user with a different role
// reset (any) user password route
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const User = require('../models/User');

// Middleware to check if the user is an admin
const { isAdmin } = require('../middleware/roles');
const { authenticateToken } = require('../middleware/authenticate');

router.post(
  '/reset-user-password',
  authenticateToken,
  isAdmin,
  async (req, res) => {
    try {
      const { username, email, newPassword } = req.body;

      // Check if either username or email is provided
      if (!username && !email) {
        return res
          .status(400)
          .json({ message: 'Provide either username or email' });
      }

      // Find the user by username or email
      const user = await User.findOne({ $or: [{ username }, { email }] });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Hash the new password before updating
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // Update the password in the database
      user.password = hashedNewPassword;
      await user.save();

      res.status(200).json({ message: 'User password reset successful' });
    } catch (error) {
      console.error('Error during user password reset:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

module.exports = router;
