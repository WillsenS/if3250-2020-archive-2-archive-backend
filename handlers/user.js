const axios = require('axios');
const convert = require('xml-js');
const jwt = require('jsonwebtoken');
const formidable = require('formidable');
const User = require('../models/User');
const { defaultURL } = require('../config');
const { sendResponse } = require('../helpers');

// const HIGHEST_ADMIN_ROLE = 1; // Admin Terpusat
const DEFAULT_ROLE = 2; // Internal ITB Non-Admin

const secret = process.env.SESSION_SECRET;

/**
 * Router that will check ticket from SSO ITB
 * if the ticket is match, then user is authentication.
 * @param {ticket} req.query User object that's being stored in the request object.
 */
exports.checkSSORedirect = () => {
  return async (req, res, next) => {
    const { ticket } = req.query;

    if (ticket != null) {
      try {
        const response = await axios.get(
          `https://login.itb.ac.id/cas/serviceValidate?ticket=${ticket}&service=${defaultURL}`
        );

        const result = await JSON.parse(
          convert.xml2json(response.data, { compact: true, spaces: 4 })
        );
        const serviceResponse = result['cas:serviceResponse'];

        if (serviceResponse['cas:authenticationFailure']) {
          return res.redirect(`https://login.itb.ac.id/cas/login?service=${defaultURL}`);
        }

        const successResponse = serviceResponse['cas:authenticationSuccess'];
        const username = successResponse['cas:user']._text;
        const foundUser = await User.findOne({ username });

        let payload;

        if (!foundUser) {
          const successAttributes = successResponse['cas:attributes'];
          const fullname = successAttributes['cas:cn']._text;
          const mail = successAttributes['cas:mail']._text;
          const mailNonITB = successAttributes['cas:itbEmailNonITB']._text;
          const ou = successAttributes['cas:ou']._text;
          const status = successAttributes['cas:itbStatus']._text;
          const role = 2; // Default role is 'Internal ITB'

          const userData = {
            username,
            fullname,
            mail,
            mailNonITB,
            ou,
            status,
            role
          };
          const newUser = new User(userData);
          await newUser.save();

          payload = { user: newUser };
        } else {
          payload = { user: foundUser };
        }

        const token = await jwt.sign(payload, secret, {
          expiresIn: '1h'
        });

        return sendResponse(res, 200, 'OK', { username, token });
      } catch (err) {
        return sendResponse(res, 500, 'Error occured during sign in process');
      }
    }

    return next();
  };
};

/**
 * Handling user sign in by redirect to SSO ITB.
 */
exports.signInSSO = (req, res) => {
  const redirectURL = `https%3A%2F%2F${req.headers.host}${req.baseUrl}`;
  res.redirect(`https://login.itb.ac.id/cas/login?service=${redirectURL}`);
};

/**
 * Handling user sign out by removing user session from database.
 */
exports.postSignout = async (req, res) => {
  try {
    return req.session.destroy(err => {
      if (err) {
        return sendResponse(res, 500, 'Error occured during signing out process');
      }

      req.session.user = null;
      return sendResponse(res, 200, 'Successfully logged out');
    });
  } catch (e) {
    console.error(`User could not log out: ${e.message}`);
    return sendResponse(res, 400, 'Error occured during sign out process');
  }
};

const findUsers = async (page, q, res) => {
  let baseLink;
  let searchQuery;
  const limit = 10;

  if (q) {
    searchQuery = {
      $text: {
        $search: q
          .split(' ')
          .map(str => `"${str}"`)
          .join(' ')
      }
    };
    baseLink = `${process.env.BASE_URL}/api/v1/user-search?q=${q}`;
  } else {
    searchQuery = {};
    baseLink = `${process.env.BASE_URL}/api/v1/users?`;
  }

  const countUser = await User.countDocuments(searchQuery);
  const foundUser = await User.find(searchQuery)
    .limit(limit)
    .skip((page - 1) * limit);

  const totalPages = Math.ceil(countUser / limit);
  const nextLink = totalPages > page ? `${baseLink}page=${page + 1}` : '#';
  const prevLink = page > 1 ? `${baseLink}page=${page - 1}` : '#';

  return sendResponse(res, 200, 'Sucessfully retrieved users', {
    count: countUser,
    currentPage: page,
    totalPages,
    nextLink,
    prevLink,
    data: foundUser
  });
};

const findAdmins = async (page, role, res, q) => {
  let searchQuery = {};
  const limit = 10;

  if (q) {
    searchQuery = {
      $text: {
        $search: q
          .split(' ')
          .map(str => `"${str}"`)
          .join(' ')
      }
    };
  }

  if (role) {
    searchQuery.role = { $eq: role };
  } else {
    searchQuery.role = {
      $not: {
        $eq: DEFAULT_ROLE
      }
    };
  }

  const [countAdmin, foundAdmin] = await Promise.all([
    User.countDocuments(searchQuery),
    User.find(searchQuery)
      .limit(limit)
      .skip((page - 1) * limit)
  ]);
  const totalPages = Math.ceil(countAdmin / limit);

  return sendResponse(res, 200, 'Sucessfully retrieved admins', {
    count: countAdmin,
    currentPage: page,
    totalPages,
    data: foundAdmin
  });
};

const findNonAdmins = async (page, limit, res) => {
  const searchQuery = {
    role: {
      $eq: DEFAULT_ROLE
    }
  };

  const countNonAdmin = await User.countDocuments(searchQuery);
  const foundNonAdmin = limit
    ? await User.find(searchQuery)
        .limit(limit)
        .skip((page - 1) * limit)
    : await User.find(searchQuery);
  const totalPages = limit ? Math.ceil(countNonAdmin / limit) : countNonAdmin;

  return sendResponse(res, 200, 'Sucessfully retrieved ordinary users', {
    count: countNonAdmin,
    currentPage: page,
    totalPages,
    data: foundNonAdmin
  });
};

exports.getUsers = async (req, res) => {
  try {
    let { page } = req.query;
    page = parseInt(page, 10) > 0 ? parseInt(page, 10) : 1;

    return await findUsers(page, null, res);
  } catch (err) {
    console.error(err.message);
    return sendResponse(res, 400, 'Error. Bad request');
  }
};

exports.searchUser = async (req, res) => {
  try {
    const { q, page } = req.query;

    return await findUsers(page, q, res);
  } catch (err) {
    console.error(err.message);
    return sendResponse(res, 400, 'Error. Bad request');
  }
};

exports.getUserDetail = async (req, res) => {
  const { id } = req.params;
  try {
    const foundUser = await User.findById(id);

    return sendResponse(res, 200, 'Sucessfully retrieved user detail', {
      data: foundUser
    });
  } catch (err) {
    console.error(err.message);
    return sendResponse(res, 400, 'Error. User not found');
  }
};

exports.updateUserRole = async (req, res) => {
  const { id } = req.params;
  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields) => {
    try {
      const dataUser = {
        role: fields.kode_role
      };

      await User.findByIdAndUpdate(id, dataUser);

      return sendResponse(res, 200, 'Successfully edited user');
    } catch (e) {
      console.error(e);
      return sendResponse(res, 400, 'Error. User not found');
    }
  });
};

exports.removeAdminAccessFromUser = async (req, res) => {
  try {
    const { id } = req.params;
    const dataUser = {
      role: DEFAULT_ROLE
    };

    await User.findByIdAndUpdate(id, dataUser);

    return sendResponse(res, 200, 'Successfully removed admin access from user');
  } catch (e) {
    console.error(e);
    return sendResponse(res, 400, 'Error. User not found');
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    await User.findByIdAndDelete(id);
    return sendResponse(res, 200, 'Successfully deleted user');
  } catch (err) {
    console.error(err.message);
    return sendResponse(res, 400, 'Error. User not found');
  }
};

exports.getAdmins = async (req, res) => {
  try {
    let { page } = req.query;
    const { role, q } = req.query;
    page = parseInt(page, 10) > 0 ? parseInt(page, 10) : 1;
    return await findAdmins(page, role, res, q);
  } catch (err) {
    console.error(err.message);
    return sendResponse(res, 400, 'Error. Bad request');
  }
};

exports.getNonAdmins = async (req, res) => {
  try {
    let { page } = req.query;
    const { limit } = req.query;
    page = parseInt(page, 10) > 0 ? parseInt(page, 10) : 1;
    const limitFilter = limit ? parseInt(limit, 10) : null;
    return await findNonAdmins(page, limitFilter, res);
  } catch (err) {
    console.error(err.message);
    return sendResponse(res, 400, 'Error. Bad request');
  }
};
