const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Assuming you have a User model
const { verifyJWT } = require('../middleware/verifyJWT');
const { ROLES, appointmentStatus } = require('../constants');
const moment = require('moment');
const Appointment = require('../models/Appointment');

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
    const { date, type, location } = req.query;
    const offset = moment().utcOffset();
    const dateObject = moment(date).add(offset, 'minutes');
    const dayOfWeek = dateObject.format('dddd');
    const trainersList = await User.find({
      role: ROLES.TRAINER,
      trainerType: type,
      locations: { $in: [location] },
    }).lean();

    let availableAppointments = [];
    await Promise.all(
      trainersList.map(async trainer => {
        let { schedule } = trainer;
        schedule = schedule.filter(item => item.location === location)[0];
        console.log(schedule);
        const { availability } = schedule;

        if (!schedule) return;

        for (let i = 0; i < availability.length; i++) {
          const { availableTimes, day } = availability[i];
          if (day === dayOfWeek) {
            for (const key in availableTimes) {
              const existingAppointment = await Appointment.findOne({
                trainerId: trainer._id,
                date: dateObject.toISOString(),
                time: key,
                status: appointmentStatus.CONFIRMED,
              });

              if (existingAppointment) {
                delete availableTimes[key];
              }

              if (!availableTimes[key]) delete availableTimes[key];
            }
            availableAppointments.push({
              day: availability[i].day,
              trainer: trainer.name,
              availableTimes: availableTimes,
              type: trainer.trainerType,
              trainerId: trainer._id,
            });
          }
        }
      })
    );
    return res.status(200).json({ data: availableAppointments, location });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
