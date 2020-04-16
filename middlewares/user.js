const secret = 'mysecretsshhh';
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const { sendResponse } = require('../helpers');

const isValid = async user => {
  const { _id } = user;
  const foundUser = await User.findById(_id);

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
 * @param {object} req.session.user User object that was created by passport
 */
exports.isAuthenticated = async (req, res, next) => {
  try {
    const bearerHeader = req.headers.authorization;

    if (bearerHeader) {
      const bearer = bearerHeader.split(' ');
      const bearerToken = bearer[1];

      const decode = jwt.verify(bearerToken, secret);
      const valid = await isValid(decode.user);

      if (decode.user && valid) {
        req.session.user = decode.user;
        return next();
      }
    }

    return res.json({
      apiVersion: res.locals.apiVersion,
      error: {
        code: 401,
        message: 'You are not allowed.'
      }
    });
  } catch (e) {
    if (e.name === 'JsonWebTokenError') {
      return res.json({
        apiVersion: res.locals.apiVersion,
        error: {
          code: 401,
          message: 'You are not allowed.'
        }
      });
    }

    return res.json({
      apiVersion: res.locals.apiVersion,
      error: {
        code: 500,
        message: `Error: ${e.message}`
      }
    });
  }
};

/**
 * Middleware that checks if the request comes from non authenticated user
 * @param {object} req.session.user User object that was created by passport
 */
exports.isNonAuthenticated = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return next();
  }
  return res.json({
    apiVersion: res.locals.apiVersion,
    error: {
      code: 401,
      message: 'You are not allowed.'
    }
  });
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

    const decode = jwt.verify(bearerToken, secret);
    const valid = await isValid(decode.user);

    if (decode.user && valid) {
      req.session.user = decode.user;
      let isRoleValid = false;
      const { user } = decode;

      const { _id } = user;
      const foundUser = await User.findById(_id);

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
  } catch (e) {
    console.error(e);
    return sendResponse(res, 500, `Error: ${e}`);
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
