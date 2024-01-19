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

module.exports = { statusCodes, cookieOptions, ROLES, trainerTypes };
