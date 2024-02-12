const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const validateRegisterInput = require('../validators/validateSignUp');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const { verifyJWT } = require('../middleware/verifyJWT');
const { appointmentStatus, ROLES } = require('../constants');

router.post('/signup', async (req, res) => {
  try {
    const { username, email, password, name, defaultLocation, trainerType } =
      req.body;

    const { errors, isValid } = validateRegisterInput(req.body);

    // Check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }

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
    const user = await User.findById(userId).select('-password');

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
  const { date, time, trainerId } = req.body;
  const userId = req.user._id;

  // @TODO check if anyone has previously saved this appointment
  const existingAppointment = await Appointment.findOne({
    trainerId,
    date,
    time,
    status: appointmentStatus.CONFIRMED,
  });
  if (existingAppointment) {
    return res.status(409).json({
      error: 'Conflict',
      message: 'Appointment already taken',
    });
  }

  const newAppointment = new Appointment({
    trainerId,
    userId,
    date,
    time,
    status: appointmentStatus.CONFIRMED, // Assuming you want to set the status to 'Confirmed' by default
  });

  // Saving the appointment to the database
  const savedAppointment = await newAppointment.save();

  // Sending a response
  res.status(200).json({
    message: 'Appointment registered successfully',
    appointment: savedAppointment,
  });
});

// @TODO just for testing
router.get('/protected', verifyJWT, (req, res) => {
  // If the token is valid, this code will be executed
  res.json({ message: 'This is a protected route', user: req.user });
});

module.exports = router;
