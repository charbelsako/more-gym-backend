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

router.get('/static-data', verifyJWT, async (req, res) => {
  try {
    const staticData = await StaticData.findOne();

    res.status(200).json(staticData);
  } catch (err) {
    res.status(500).json({ message: 'internal server error' });
  }
});

// Route to update static data (accessible only by admins)
router.put('/update-static-data', verifyJWT, isAdmin, async (req, res) => {
  try {
    const { locations, cancelTime, classTypes, maxAppointments } = req.body;
    let staticData = await StaticData.findOne(); // Assuming there's only one staticData document

    if (!staticData) {
      staticData = new StaticData();
    }

    staticData.locations = locations;
    staticData.cancelTime = cancelTime;
    staticData.classTypes = classTypes;
    staticData.maxAppointments = maxAppointments;

    await staticData.save();

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
    const { type, sessionType, subType, price } = req.body;

    // Validate that 'type' and 'capacity' are provided
    if (!type || !sessionType || !subType || !price) {
      return res.status(400).json({
        error:
          'Number of sessions and package type + subtype and price are required',
      });
    }

    // Create a new Membership document
    const newMembership = new Membership({ type, sessionType, price, subType });

    // Save the document to the database
    const savedMembership = await newMembership.save();

    res.status(201).json(savedMembership);
  } catch (error) {
    console.error('Error creating Membership:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/get-memberships', async (req, res) => {
  try {
    const memberships = await Membership.find({})
      .populate('sessionType')
      .populate('type')
      .populate('subType');
    res.status(200).json(memberships);
  } catch (error) {
    console.error('Error getting Membership:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/users', verifyJWT, isAdmin, async (req, res) => {
  try {
    const users = await User.find({
      role: { $in: [ROLES.CUSTOMER] },
    })
      .select('-refreshToken -password -schedule')
      .populate({
        path: 'membership',
        populate: [{ path: 'type' }, { path: 'subType' }],
      })
      .sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    console.error('Error getting Users:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/trainers', verifyJWT, isAdmin, async (req, res) => {
  try {
    const users = await User.find({
      role: { $in: [ROLES.TRAINER] },
    })
      .select('-refreshToken -password -schedule')
      .populate({
        path: 'membership',
        populate: [{ path: 'type' }, { path: 'subType' }],
      })
      .sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    console.error('Error getting Users:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post(
  '/add-customer-membership',
  verifyJWT,
  isAdmin,
  async (req, res) => {
    try {
      const { membership, userId: userEmail } = req.body;
      const currentDate = moment();

      const user = await User.findOne({ email: userEmail });

      if (!user) throw new Error('User not found');

      const membershipObject = await Membership.findById(membership).populate(
        'subType'
      );

      user.membership = membership;

      user.membershipStartDate = currentDate;
      user.membershipEndDate = currentDate.add(30, 'days');
      user.numberOfSessions = membershipObject.subType.numberOfSessions;

      await user.save();

      const membershipHistory = new MembershipHistory({
        userId: user._id,
        membership,
        membershipStartDate: user.membershipStartDate,
        membershipEndDate: user.membershipEndDate,
      });
      await membershipHistory.save();

      res.status(200).json(user.membership);
    } catch (error) {
      console.error('Error setting user membership:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

router.get('/membership-renewal', verifyJWT, isAdmin, async (req, res) => {
  try {
    const thisWeekStart = moment().startOf('week');
    const thisWeekEnd = moment().endOf('week');
    const users = await User.find({
      membershipEndDate: { $lte: thisWeekEnd, $gte: thisWeekStart },
    });
    res.status(200).json(users);
  } catch (err) {
    console.log('Error getting user with memberships ending this week');
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
