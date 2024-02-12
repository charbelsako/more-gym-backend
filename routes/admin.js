// create trainer route a trainer is a user with a different role
// reset (any) user password route
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const StaticData = require('../models/StaticData');

// Middleware to check if the user is an admin
const { isAdmin } = require('../middleware/roles');

router.post('/reset-user-password', verifyJWT, isAdmin, async (req, res) => {
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
});

// Route to update static data (accessible only by admins)
router.put('/update-static-data', verifyJWT, isAdmin, async (req, res) => {
  try {
    const { locations, cancelTime, classTypes } = req.body;
    // Update the static data based on the request body
    await StaticData.findOneAndUpdate(
      {},
      { locations, cancelTime, classTypes },
      {
        upsert: true,
        new: true,
      }
    );

    res
      .status(200)
      .json({ message: 'Static data updated or created successfully' });
  } catch (error) {
    console.error('Error updating static data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
