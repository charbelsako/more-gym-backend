const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // You may need to install this package
const jwt = require('jsonwebtoken'); // You may need to install this package
const { authenticateToken } = require('../middleware/authenticate');

const User = require('../models/User'); // Assuming you have a User model

router.post('/signup', async (req, res) => {
  try {
    const { username, email, password, name } = req.body;

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
    });

    await newUser.save();

    res.status(201).json({ message: 'User signed up successfully' });
  } catch (error) {
    console.error('Error during sign-up:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user with the given email
    const user = await User.findOne({ email });

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // If the password is valid, create a JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res
      .status(200)
      .json({ token, userId: user._id, message: 'Login successful' });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/protected', authenticateToken, (req, res) => {
  // If the token is valid, this code will be executed
  res.json({ message: 'This is a protected route', user: req.user });
});

module.exports = router;
