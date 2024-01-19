const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Assuming you have a User model
const { verifyJWT } = require('../middleware/verifyJWT');
const { ROLES } = require('../constants');
const moment = require('moment');

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

router.get('/get-availability', verifyJWT, async (req, res) => {
  try {
    const { date, type } = req.body;
    const dayOfWeek = moment(date).format('dddd');
    console.log(dayOfWeek);
    // @TODO: find trainers with that type
    const trainersList = await User.find({
      role: ROLES.TRAINER,
      trainerType: type,
    }).lean();
    console.log(trainersList);
    // @TODO return available times for that day
    let availableAppointments = [];
    await Promise.all(
      trainersList.map(trainer => {
        const { schedule } = trainer;
        if (!schedule) return;
        for (let i = 0; i < schedule.length; i++) {
          const { availableTimes, day } = schedule[i];
          if (day === dayOfWeek) {
            for (const key in availableTimes) {
              if (!availableTimes[key]) delete availableTimes[key];
            }
            availableAppointments.push({
              day: schedule[i].day,
              trainer: trainer.name,
              availableTimes: availableTimes,
              type: trainer.trainerType,
            });
          }
        }
      })
    );
    return res.status(200).json({ data: availableAppointments });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
