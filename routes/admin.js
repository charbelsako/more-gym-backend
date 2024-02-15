// create trainer route a trainer is a user with a different role
// reset (any) user password route
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const StaticData = require('../models/StaticData');
const PackageType = require('../models/PackageType');
const SessionType = require('../models/SessionType');
const TrainerPackageType = require('../models/TrainerPackageType');

// Middleware to check if the user is an admin
const { isAdmin } = require('../middleware/roles');
const { verifyJWT } = require('../middleware/verifyJWT');

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

router.post('/create-package-type', verifyJWT, isAdmin, async (req, res) => {
  try {
    const { type } = req.body;

    // Validate that 'type' is provided
    if (!type) {
      return res.status(400).json({ error: 'Type is required' });
    }

    // Create a new PackageType document
    const newPackageType = new PackageType({ type });

    // Save the document to the database
    const savedPackageType = await newPackageType.save();

    res.status(201).json({ message: 'Successfully created a package type' });
  } catch (error) {
    console.error('Error creating PackageType:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/create-session-type', verifyJWT, isAdmin, async (req, res) => {
  try {
    const { sessionNumber } = req.body;

    // Validate that 'type' is provided
    if (!sessionNumber) {
      return res.status(400).json({ error: 'Number of sessions is required' });
    }

    const newSessionType = new SessionType({ numberOfSessions: sessionNumber });

    await newSessionType.save();

    res.status(201).json({ message: 'Successfully created a session type' });
  } catch (error) {
    console.error('Error creating PackageType:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post(
  '/create-trainer-package-type',
  verifyJWT,
  isAdmin,
  async (req, res) => {
    try {
      const { type, capacity } = req.body;

      // Validate that 'type' and 'capacity' are provided
      if (!type || !capacity) {
        return res
          .status(400)
          .json({ error: 'Type and capacity are required' });
      }

      // Create a new TrainerPackageType document
      const newTrainerPackageType = new TrainerPackageType({ type, capacity });

      // Save the document to the database
      const savedTrainerPackageType = await newTrainerPackageType.save();

      res.status(201).json(savedTrainerPackageType);
    } catch (error) {
      console.error('Error creating TrainerPackageType:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

router.get(
  '/get-trainer-package-types',
  verifyJWT,
  isAdmin,
  async (req, res) => {
    try {
      const types = await TrainerPackageType.find({})
        .populate('capacity')
        .populate('type');
      res.status(200).json(types);
    } catch (error) {
      console.error('Error getting TrainerPackageType:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

module.exports = router;
