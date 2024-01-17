const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Assuming you have a User model
const { verifyJWT } = require('../middleware/verifyJWT');

router.post('/add-time', verifyJWT, async (req, res) => {
  try {
    const userId = req.user._id; // Assuming user information is stored in req.user
    const schedule = req.body.schedule;

    // Find the user by userId
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Update the user's schedule
    user.schedule = schedule;

    // Save the updated user
    await user.save();

    return res.status(200).json({ message: 'Schedule added successfully.' });
  } catch (err) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
