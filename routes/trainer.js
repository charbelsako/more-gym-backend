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

    const id = req.user._id;
    const user = await User.findById(id).populate({
      path: 'membership',
      select: 'type',
      populate: [{ path: 'type' }],
    });
    if (!user.membership) {
      return res.status(500).json({ error: 'user has no membership' });
    }
    const { _id } = user.membership.type;
    const trainersList = await User.find({
      role: ROLES.TRAINER,
      trainerType: type,
      locations: { $in: [location] },
      trainerPackageType: _id,
    })
      .populate('trainerPackageType')
      .lean();

    let availableAppointments = [];
    await Promise.all(
      trainersList.map(async trainer => {
        let { schedule, trainerPackageType } = trainer;
        schedule = schedule.filter(item => item.location === location)[0];
        const { availability } = schedule;

        if (!schedule) return;

        for (let i = 0; i < availability.length; i++) {
          const { availableTimes, day } = availability[i];
          if (day === dayOfWeek) {
            for (const key in availableTimes) {
              const existingAppointments = await Appointment.find({
                trainerId: trainer._id,
                date: dateObject.toISOString(),
                time: key,
                status: appointmentStatus.CONFIRMED,
              });

              if (existingAppointments.length >= trainerPackageType.capacity) {
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

router.get('/appointments/all', verifyJWT, async (req, res) => {
  try {
    const { date, location } = req.query;
    const startDate = moment(date).startOf('day');
    const endDate = moment(date).endOf('day');

    const appointments = await Appointment.find({
      trainerId: req.user._id,
      ...(date ? { date: { $gte: startDate, $lte: endDate } } : {}),
      location,
    })
      .sort({
        date: -1,
        time: -1,
      })
      .populate('userId');
    res.status(200).json(appointments);
  } catch (err) {
    console.log(err);
    res.status(500).send('Internal server error');
  }
});

router.get('/appointments/today', verifyJWT, async (req, res) => {
  try {
    const { location } = req.query;
    const todayStart = moment().startOf('day');
    const todayEnd = moment().endOf('day');
    const todaysAppointments = await Appointment.find({
      trainerId: req.user._id,
      date: { $gte: todayStart, $lte: todayEnd },
      location,
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

module.exports = router;
