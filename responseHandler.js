const { statusCodes } = require('./constants');

async function sendError({ res, error = undefined, code, errorLabel }) {
  if (!error) return res.sendStatus(code);

  if (code === statusCodes.BAD_REQUEST && error.message) {
    return res.status(code).send(error);
  }

  if (error.message) {
    return res
      .status(code)
      .send({ error: error.message || 'Something went wrong' });
  }
  res.status(code).send({ error: error });
}

async function sendResponse(res, data) {
  const returnData = {
    success: true,
    data: data,
  };
  res.status(statusCodes.OK).send(returnData);
}

async function sendStatus(res, code) {
  res.sendStatus(code);
}

module.exports = { sendStatus, sendError, sendResponse };
