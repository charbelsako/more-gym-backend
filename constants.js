const statusCodes = {
  SERVER_ERROR: 500,
  FORBIDDEN: 403,
  UNAUTHORIZED: 401,
  BAD_REQUEST: 400,
  NO_CONTENT: 204,
  OK: 200,
};

const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'none',
};

const ROLES = {
  TRAINER: 'trainer',
  CUSTOMER: 'customer',
  ADMIN: 'admin',
};

const trainerTypes = {
  BOXING: 'Boxing',
  PT: 'PT',
  Physio: 'Physio',
  Pilates: 'Pilates',
};

const appointmentStatus = {
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
};

const scheduleStructure = {
  availability: [
    {
      day: 'Monday',
      availableTimes: {
        6: false,
        7: false,
        8: false,
        9: false,
        10: false,
        11: false,
        12: false,
        13: false,
        14: false,
        15: false,
        16: false,
        17: false,
        18: false,
        19: false,
        20: false,
        21: false,
        22: false,
      },
    },
    {
      day: 'Tuesday',
      availableTimes: {
        6: false,
        7: false,
        8: false,
        9: false,
        10: false,
        11: false,
        12: false,
        13: false,
        14: false,
        15: false,
        16: false,
        17: false,
        18: false,
        19: false,
        20: false,
        21: false,
        22: false,
      },
    },
    {
      day: 'Wednesday',
      availableTimes: {
        6: false,
        7: false,
        8: false,
        9: false,
        10: false,
        11: false,
        12: false,
        13: false,
        14: false,
        15: false,
        16: false,
        17: false,
        18: false,
        19: false,
        20: false,
        21: false,
        22: false,
      },
    },
    {
      day: 'Thursday',
      availableTimes: {
        6: false,
        7: false,
        8: false,
        9: false,
        10: false,
        11: false,
        12: false,
        13: false,
        14: false,
        15: false,
        16: false,
        17: false,
        18: false,
        19: false,
        20: false,
        21: false,
        22: false,
      },
    },
    {
      day: 'Friday',
      availableTimes: {
        6: false,
        7: false,
        8: false,
        9: false,
        10: false,
        11: false,
        12: false,
        13: false,
        14: false,
        15: false,
        16: false,
        17: false,
        18: false,
        19: false,
        20: false,
        21: false,
        22: false,
      },
    },
    {
      day: 'Saturday',
      availableTimes: {
        8: false,
        9: false,
        10: false,
        11: false,
        12: false,
        13: false,
        14: false,
        15: false,
      },
    },
  ],
};

module.exports = {
  appointmentStatus,
  statusCodes,
  cookieOptions,
  ROLES,
  trainerTypes,
  scheduleStructure,
};
