// create trainer route a trainer is a user with a different role
// reset (any) user password route
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const moment = require('moment');

const User = require('../models/User');
const StaticData = require('../models/StaticData');
const PackageType = require('../models/PackageType');
const PackageSubtype = require('../models/PackageSubtype');
const Membership = require('../models/Membership');
const MembershipHistory = require('../models/MembershipHistory');

// Middleware to check if the user is an admin
const { isAdmin } = require('../middleware/roles');
const { verifyJWT } = require('../middleware/verifyJWT');
const { ROLES } = require('../constants');

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
    const { type, capacity } = req.body;

    // Validate that 'type' is provided
    if (!type) {
      return res.status(400).json({ error: 'Type is required' });
    }

    // Create a new PackageType document
    const newPackageType = new PackageType({ type, capacity });

    // Save the document to the database
    await newPackageType.save();

    res.status(201).json({ message: 'Successfully created a package type' });
  } catch (error) {
    console.error('Error creating PackageType:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/create-package-subtype', verifyJWT, isAdmin, async (req, res) => {
  try {
    const { sessionNumber } = req.body;

    // Validate that 'type' is provided
    if (!sessionNumber) {
      return res.status(400).json({ error: 'Number of sessions is required' });
    }

    const newPackageSubType = new PackageSubtype({
      numberOfSessions: sessionNumber,
    });

    await newPackageSubType.save();

    res.status(201).json({ message: 'Successfully created a session type' });
  } catch (error) {
    console.error('Error creating PackageType:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/get-package-subtypes', verifyJWT, isAdmin, async (req, res) => {
  try {
    const packageSubTypes = await PackageSubtype.find();
    res.status(200).json(packageSubTypes);
  } catch (error) {
    console.error('Error getting Package Sub types:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/get-package-types', verifyJWT, isAdmin, async (req, res) => {
  try {
    const packageTypes = await PackageType.find();
    res.status(200).json(packageTypes);
  } catch (error) {
    console.error('Error getting Package types:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/create-membership', verifyJWT, isAdmin, async (req, res) => {
  try {
    const { type, sessionType, subtype, price } = req.body;

    // Validate that 'type' and 'capacity' are provided
    if (!type || !sessionType || !subtype || !price) {
      return res.status(400).json({
        error:
          'Number of sessions and package type + subtype and price are required',
      });
    }

    // Create a new Membership document
    const newMembership = new Membership({ type, sessionType, price, subtype });

    // Save the document to the database
    const savedMembership = await newMembership.save();

    res.status(201).json(savedMembership);
  } catch (error) {
    console.error('Error creating Membership:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/get-memberships', verifyJWT, isAdmin, async (req, res) => {
  try {
    const types = await Membership.find({})
      .populate('sessionType')
      .populate('type')
      .populate('subtype');
    res.status(200).json(types);
  } catch (error) {
    console.error('Error getting Membership:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/users', verifyJWT, isAdmin, async (req, res) => {
  try {
    const users = await User.find({
      role: { $in: [ROLES.CUSTOMER, ROLES.TRAINER] },
    })
      .select('-refreshToken -password -schedule')
      .populate({
        path: 'membership',
        populate: [{ path: 'type' }, { path: 'capacity' }],
      })
      .sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    console.error('Error getting Users:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/add-customer-membership', verifyJWT, async (req, res) => {
  try {
    const { membership, userId } = req.body;
    const currentDate = moment();

    const user = await User.findById(userId);

    if (!user) throw new Error('User not found');

    user.membership = membership;

    user.membershipStartDate = currentDate;
    user.membershipEndDate = currentDate.add(30, 'days');

    await user.save();

    const membershipHistory = new MembershipHistory({ userId, membership });
    await membershipHistory.save();

    res.status(200).json(user.membership);
  } catch (error) {
    console.error('Error setting user membership:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
