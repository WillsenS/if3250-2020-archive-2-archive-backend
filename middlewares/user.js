const secret = 'mysecretsshhh';
const jwt = require('jsonwebtoken');

const User = require('../models/User');

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
  const bearerHeader = req.headers.authorization;
  if (bearerHeader) {
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];

    const decode = jwt.verify(bearerToken, secret);

    const valid = await isValid(decode.user);
    console.log(valid);
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
