const moment = require('moment');
const jwt = require('jsonwebtoken');
const Archive = require('../models/Archive');
const User = require('../models/User');
const Borrow = require('../models/Borrow');
const { sendResponse } = require('../helpers');

/**
 * Check is user is valid. Valid means all of his information is equal with DB.
 * @param {object} user Data of user given from sso ITB response.
 */
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

const HIGHEST_ADMIN_ROLE = 1; // Admin Terpusat

/**
 * Middleware that checks if user is authorized for archive
 * @param {object} req.header.authorization Bearer header from user's request.
 */
exports.isAuthArchive = async (req, res, next) => {
  try {
    const { id } = req.params;
    const foundArchive = await Archive.findById(id);

    if (!foundArchive.keamanan_terbuka) {
      const bearerHeader = req.headers.authorization;

      if (bearerHeader) {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];

        const decode = jwt.verify(bearerToken, process.env.SESSION_SECRET);
        const valid = await isValid(decode.user);

        if (decode.user && valid) {
          req.session.user = decode.user;
          let isHighestAdmin = false;
          const { user } = decode;

          const { _id } = user;
          const foundUser = await User.findById(_id);

          isHighestAdmin = user.role === HIGHEST_ADMIN_ROLE && foundUser.role === user.role;

          if (isHighestAdmin) {
            return next();
          }
        }
      }

      const foundBorrow = await Borrow.find({
        borrower: req.session.user._id,
        archive: id,
        status: 1
      });

      if (foundBorrow.length > 0) {
        return next();
      }

      return sendResponse(res, 401, "You're not allowed to acces this archive");
    }

    return next();
  } catch (e) {
    if (e.name === 'JsonWebTokenError')
      return sendResponse(res, 401, "You're not allowed to acces this archive");

    return sendResponse(res, 500, 'Error: Bad Request');
  }
};
