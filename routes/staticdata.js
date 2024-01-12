const express = require('express');
const router = express.Router();

const StaticData = require('../models/StaticData');
const { authenticateToken } = require('../middleware/authenticate');

// Route to get locations from static data
router.get('/locations', authenticateToken, async (req, res) => {
  try {
    const staticData = await StaticData.findOne();
    if (!staticData) {
      return res.status(404).json({ message: 'Static data not found' });
    }

    const locations = staticData.locations || [];
    res.status(200).json({ locations });
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route to get cancelTime from static data
router.get('/cancel-time', authenticateToken, async (req, res) => {
  try {
    const staticData = await StaticData.findOne();
    if (!staticData) {
      return res.status(404).json({ message: 'Static data not found' });
    }

    const cancelTime = staticData.cancelTime || 0;
    res.status(200).json({ cancelTime });
  } catch (error) {
    console.error('Error fetching cancelTime:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route to get classTypes from static data
router.get('/class-types', authenticateToken, async (req, res) => {
  try {
    const staticData = await StaticData.findOne();
    if (!staticData) {
      return res.status(404).json({ message: 'Static data not found' });
    }

    const classTypes = staticData.classTypes || [];
    res.status(200).json({ classTypes });
  } catch (error) {
    console.error('Error fetching classTypes:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
