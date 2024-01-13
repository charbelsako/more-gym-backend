const User = require('../../models/User');
const { sendError, sendResponse } = require('../../responseHandler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { cookieOptions, statusCodes } = require('../../constants.js');
require('dotenv').config();

async function handleLogin(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return sendError({
        res,
        error: { message: 'Email and password are required.' },
        code: statusCodes.BAD_REQUEST,
      });

    const foundUser = await User.findOne({ email });
    if (!foundUser) return sendError({ res, code: statusCodes.UNAUTHORIZED }); //Unauthorized

    const match = await bcrypt.compare(password, foundUser.password);
    if (!match) {
      return sendError({ res, code: statusCodes.UNAUTHORIZED });
    }

    const accessToken = jwt.sign(
      { email, role: foundUser.role, _id: foundUser._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '30m' }
    );

    const refreshToken = jwt.sign(
      { email, role: foundUser.role, _id: foundUser._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '1d' }
    );

    foundUser.refreshToken = refreshToken;
    await foundUser.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000,
    });

    sendResponse(res, {
      accessToken,
      role: foundUser.role,
      email: foundUser.email,
    });
  } catch (loginError) {
    sendError({ res, error: loginError, code: 500 });
  }
}

async function handleRefreshToken(req, res) {
  try {
    const cookies = req.cookies;
    if (!cookies?.refreshToken) return sendError({ res, code: 401 });

    const refreshToken = cookies.refreshToken;

    const foundUser = await User.findOne({ refreshToken });
    if (!foundUser) return sendError({ res, code: statusCodes.FORBIDDEN });

    const token = await jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    if (foundUser.email !== token.email) {
      return sendError({ res, code: statusCodes.FORBIDDEN });
    }

    const accessToken = await jwt.sign(
      { email: token.email, role: token.role, _id: token._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '30s' }
    );

    sendResponse(res, {
      accessToken,
      role: foundUser.role,
      email: token.email,
    });
  } catch (refreshTokenError) {
    sendError({ res, error: refreshTokenError, code: 500 });
  }
}

async function handleLogout(req, res) {
  try {
    const cookies = req.cookies;
    if (!cookies?.refreshToken) return res.sendStatus(statusCodes.NO_CONTENT);

    const refreshToken = cookies.refreshToken;

    const foundUser = await User.findOne({ refreshToken });
    if (!foundUser) {
      res.clearCookie('refreshToken', cookieOptions);
      return res.sendStatus(statusCodes.NO_CONTENT);
    }

    // Delete the refresh token
    await User.findOneAndUpdate(
      { email: foundUser.email },
      { $unset: { refreshToken: 1 } }
    );

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });

    res.sendStatus(statusCodes.NO_CONTENT);
  } catch (refreshTokenError) {
    sendError({ res, error: refreshTokenError, code: 500 });
  }
}

module.exports = { handleLogin, handleLogout, handleRefreshToken };
