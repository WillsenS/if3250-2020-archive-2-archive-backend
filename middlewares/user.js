const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendResponse } = require('../helpers');

/**
 * Check is user is valid. Valid means all of his information is equal with DB.
 * @param {object} user Data of user given from sso ITB response.
 */
const isValid = async (user, foundUser) => {
  return (
    user.username === foundUser.username &&
    user.fullname === foundUser.fullname &&
    user.mail === foundUser.mail &&
    user.mailNonITB === foundUser.mailNonITB &&
    user.ou === foundUser.ou &&
    user.status === foundUser.status
  );
};

/**
 * Middleware that checks if the request comes from authenticated user
 * @param {object} req.header.authorization Bearer header from user's request.
 */
exports.isAuthenticated = async (req, res, next) => {
  try {
    const bearerHeader = req.headers.authorization;

    if (bearerHeader) {
      const bearer = bearerHeader.split(' ');
      const bearerToken = bearer[1];

      const decode = jwt.verify(bearerToken, process.env.SESSION_SECRET);
      const { user } = decode;

      let foundUser;

      if (user) {
        const { _id } = user;
        foundUser = await User.findById(_id);
        user.role = foundUser.role;
      }

      const valid = await isValid(user, foundUser);

      if (user && valid) {
        req.session.user = user;
        return next();
      }
    }

    return sendResponse(res, 401, 'Error. You are not allowed');
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return sendResponse(res, 401, 'Error. You are not allowed');
    }

    return sendResponse(res, 500, `Error: ${err.message}`);
  }
};

/**
 * Middleware that checks if the request comes from non authenticated user
 * @param {object} req.session.user User object that was created
 */
exports.isNonAuthenticated = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return next();
  }

  return sendResponse(res, 401, 'Error. You are not allowed');
};

const HIGHEST_ADMIN_REQUEST = 'highest';
const ADMIN_ALL_LEVEL_REQUEST = 'all_level';
const ADMIN_ONLY_REQUEST = 'admin_only';

const HIGHEST_ADMIN_ROLE = 1; // Admin Terpusat
const MINIMUM_ADMIN_ROLE = 3; // Minimum value of Admin Role Code

const bearerChecker = async (req, code) => {
  const bearerHeader = req.headers.authorization;

  if (bearerHeader) {
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];

    const decode = jwt.verify(bearerToken, process.env.SESSION_SECRET);
    const { user } = decode;

    let foundUser;
    if (user) {
      foundUser = await User.findById(user._id);
      user.role = foundUser.role;
    }
    const valid = await isValid(user, foundUser);

    if (decode.user && valid) {
      req.session.user = user;
      let isRoleValid = false;

      switch (code) {
        case HIGHEST_ADMIN_REQUEST:
          isRoleValid = user.role === HIGHEST_ADMIN_ROLE && foundUser.role === user.role;
          break;
        case ADMIN_ALL_LEVEL_REQUEST:
          isRoleValid =
            (user.role === HIGHEST_ADMIN_ROLE || user.role >= MINIMUM_ADMIN_ROLE) &&
            foundUser.role === user.role;
          break;
        case ADMIN_ONLY_REQUEST:
          isRoleValid = user.role >= MINIMUM_ADMIN_ROLE && foundUser.role === user.role;
          break;
        default:
          throw new Error('Invalid request code');
      }

      return isRoleValid;
    }
  }

  return false;
};

const validateAdmin = async (req, res, next, code) => {
  try {
    const result = await bearerChecker(req, code);

    if (result) {
      return next();
    }
    return sendResponse(res, 401, 'Error. You are not allowed');
  } catch (err) {
    console.log(err);
    if (err.name === 'JsonWebTokenError')
      return sendResponse(res, 401, "You're not allowed to access");
    return sendResponse(res, 500, `Error: ${err.message}`);
  }
};

exports.isHighestAdmin = async (req, res, next) => {
  await validateAdmin(req, res, next, HIGHEST_ADMIN_REQUEST);
};

exports.isAdminAllLevel = async (req, res, next) => {
  await validateAdmin(req, res, next, ADMIN_ALL_LEVEL_REQUEST);
};

exports.isAdminOnly = async (req, res, next) => {
  await validateAdmin(req, res, next, ADMIN_ONLY_REQUEST);
};
