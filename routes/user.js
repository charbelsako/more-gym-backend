const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const moment = require('moment');

const validateRegisterInput = require('../validators/validateSignUp');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const StaticData = require('../models/StaticData');
const { verifyJWT } = require('../middleware/verifyJWT');
const { appointmentStatus, ROLES } = require('../constants');
const MembershipHistory = require('../models/MembershipHistory');

router.post('/signup', async (req, res) => {
  try {
    const { username, password, name, defaultLocation, trainerType } = req.body;

    let { email } = req.body;

    const { errors, isValid } = validateRegisterInput(req.body);

    // Check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }
    email = email.toLowerCase();
    // Check if email already exists
    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
      return res
        .status(400)
        .json({ message: 'User already exists with this email' });
    }

    // Check if the username already exists
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: 'User already exists with this username' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      name,
      defaultLocation,
      role: ROLES.CUSTOMER,
      trainerType,
    });

    await newUser.save();

    res.status(201).json({ message: 'User signed up successfully' });
  } catch (error) {
    console.error('Error during sign-up:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/reset-password', verifyJWT, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user._id;

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the old password matches the one in the database
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid old password' });
    }

    // Hash the new password before updating
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update the password in the database
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Error during password reset:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/user-data', verifyJWT, async (req, res) => {
  try {
    const userId = req.user._id;
    // Find the user by ID and exclude sensitive information like password
    const user = await User.findById(userId)
      .select('-password')
      .populate({
        path: 'membership',
        populate: [{ path: 'type' }, { path: 'subType' }],
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ userData: user });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/update-user-info', verifyJWT, async (req, res) => {
  try {
    const userId = req.user._id;
    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Check if the username already exists
    const existingUser = await User.findOne({ username: req.body.username });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: 'User already exists with this username' });
    }

    // Update user information based on the request body
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;
    user.defaultLocation = req.body.defaultLocation || user.defaultLocation;
    user.name = req.body.name || user.name;

    await user.save();

    res.status(200).json({ message: 'User information updated successfully' });
  } catch (error) {
    console.error('Error updating user information:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/register-appointment', verifyJWT, async (req, res) => {
  try {
    const { date, time, trainerId, location } = req.body;
    const userId = req.user._id;
    const user = await User.findById(req.user._id);

    const trainerObject = await User.findById(trainerId).populate(
      'trainerPackageType'
    );
    const { capacity } = trainerObject.trainerPackageType;
    // @TODO check if anyone has previously saved this appointment
    const existingAppointments = await Appointment.findOne({
      trainerId,
      date,
      time,
      status: appointmentStatus.CONFIRMED,
      location,
    });
    if (existingAppointments && existingAppointments.length >= capacity) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'Appointment already taken',
      });
    }

    if (user.numberOfSessions < 1) {
      return res.status(500).json({ message: 'Number of appointments passed' });
    }

    const currDate = moment();
    const endDateObject = moment(user.membershipEndDate);
    if (currDate.isAfter(endDateObject)) {
      return res
        .status(500)
        .json({ message: 'Membership has ended, cannot book appointment' });
    }

    const newAppointment = new Appointment({
      trainerId,
      userId,
      date,
      time,
      status: appointmentStatus.CONFIRMED,
      location,
    });

    user.numberOfSessions = user.numberOfSessions - 1;
    user.totalSessions = user.totalSessions + 1;
    user.save();

    const savedAppointment = await newAppointment.save();

    res.status(200).json({
      message: 'Appointment registered successfully',
      appointment: savedAppointment,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal server error');
  }
});

router.patch('/:id/cancel-appointment', verifyJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);

    const staticData = await StaticData.findOne();
    const { cancelTime } = staticData;
    const currTime = moment();
    const appointmentTime = moment(
      `${moment(appointment.date).format('YYYY-MM-DD')} ${appointment.time}`,
      'YYYY-MM-DD HH'
    );

    const diff = appointmentTime.diff(currTime, 'hours');

    if (diff < cancelTime) {
      return res.status(400).json({
        message: `Cannot cancel appointment when there are only ${cancelTime} hours left`,
      });
    }

    appointment.status = appointmentStatus.CANCELLED;
    await appointment.save();

    const user = await User.findById(req.user._id);
    user.totalSessions =
      user.totalSessions - 1 < 0 ? 0 : user.totalSessions - 1;
    user.numberOfSessions = user.numberOfSessions + 1;
    await user.save();

    res.status(200).json({ message: 'Cancelled Successfully' });
  } catch (err) {
    console.log(err);
    res.status(500).send('Internal server error');
  }
});

router.get('/history', verifyJWT, async (req, res) => {
  try {
    const membershipHistory = await MembershipHistory.find({
      userId: req.user._id,
    }).populate({
      path: 'membership',
      populate: [{ path: 'subType' }, { path: 'type' }],
    });
    res.status(200).json(membershipHistory);
  } catch (err) {
    console.log(err);
    res.status(500).send('Internal server error');
  }
});

router.get('/appointments/all', verifyJWT, async (req, res) => {
  try {
    const appointments = await Appointment.find({
      userId: req.user._id,
    }).sort({
      date: -1,
      time: -1,
    });
    res.status(200).json(appointments);
  } catch (err) {
    console.log(err);
    res.status(500).send('Internal server error');
  }
});

router.get('/appointments/today', verifyJWT, async (req, res) => {
  try {
    const todayStart = moment().startOf('day');
    const todayEnd = moment().endOf('day');
    const todaysAppointments = await Appointment.find({
      userId: req.user._id,
      date: { $gte: todayStart, $lte: todayEnd },
    }).sort({
      date: -1,
      time: -1,
    });
    res.status(200).json(todaysAppointments);
  } catch (err) {
    console.log(err);
    res.status(500).send('Internal server error');
  }
});

router.get('/appointments/:id', verifyJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id).sort({ createdAt: -1 });
    res.status(200).json(appointment);
  } catch (err) {
    console.log(err);
    res.status(500).send('Internal server error');
  }
});

// @TODO just for testing
router.get('/protected', verifyJWT, (req, res) => {
  // If the token is valid, this code will be executed
  res.json({ message: 'This is a protected route', user: req.user });
});

module.exports = router;
