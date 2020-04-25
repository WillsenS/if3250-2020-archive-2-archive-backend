const axios = require('axios');
const convert = require('xml-js');
const jwt = require('jsonwebtoken');
const formidable = require('formidable');
const User = require('../models/User');
const { defaultURL } = require('../config');
const { sendResponse } = require('../helpers');
const Role = require('../models/Role');

// const HIGHEST_ADMIN_ROLE = 1; // Admin Terpusat
const DEFAULT_ROLE = 2; // Internal ITB Non-Admin

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

        const token = await jwt.sign(payload, process.env.SESSION_SECRET, {
          expiresIn: '1h'
        });

        return sendResponse(res, 200, 'OK', { username, token });
      } catch (err) {
        console.log();
        return sendResponse(res, 500, 'Error occured during sign in process');
      }
    }

    return next();
  };
};

/**
 * Handling user sign in by redirecting to SSO ITB.
 * @param {express.Request} req Express request object.
 * @param {express.Response} res Express response object.
 */
exports.signInSSO = (req, res) => {
  const redirectURL = `https%3A%2F%2F${req.headers.host}${req.baseUrl}`;
  res.redirect(`https://login.itb.ac.id/cas/login?service=${redirectURL}`);
};

/**
 * Find user based  query
 * @param {number} page Number of page of request.
 * @param {string} q Filter search to only find admin that match with query query.
 * @param {express.Response} res Express response object.
 */
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

/**
 * Find admins based on role or query
 * @param {number} page Number of page of request.
 * @param {number} role Filter search to only find admin within certain role.
 * @param {express.Response} res Express response object.
 * @param {string} q Filter search to only find admin that match with query query.
 */
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

/**
 * Handling user sign in by redirecting to SSO ITB.
 * @param {number} page Number of page of request.
 * @param {number} limit Limit of result per page.
 * @param {express.Response} res Express response object.
 */
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

/**
 * Get all the users exist in DB.
 * @param {express.Request} req Express request object.
 * @param {express.Response} res Express response object.
 * @param {string} req.query.q Query from user.
 */
exports.getUsers = async (req, res) => {
  try {
    let { page } = req.query;
    page = parseInt(page, 10) > 0 ? parseInt(page, 10) : 1;

    return await findUsers(page, null, res);
  } catch (err) {
    return sendResponse(res, 500, 'Error. Bad request when get user');
  }
};

/**
 * Search user based on query
 * @param {express.Request} req Express request object.
 * @param {express.Response} res Express response object.
 * @param {string} req.query.q Query from user.
 * @param {number} req.query.page Pagination number of data.
 */
exports.searchUser = async (req, res) => {
  try {
    const { q, page } = req.query;

    return await findUsers(page, q, res);
  } catch (err) {
    return sendResponse(res, 500, 'Error. Bad request when search user');
  }
};

/**
 * Get detail of user by user id
 * @param {express.Request} req Express request object.
 * @param {express.Response} res Express response object.
 * @param {string} req.query.id User id.
 */
exports.getUserDetail = async (req, res) => {
  const { id } = req.params;
  try {
    const foundUser = await User.findById(id);

    return sendResponse(res, 200, 'Sucessfully retrieved user detail', {
      data: foundUser
    });
  } catch (err) {
    return sendResponse(res, 500, 'Error. Bad request when get user detail');
  }
};

/**
 * Update role of a user
 * @param {express.Request} req Express request object.
 * @param {express.Response} res Express response object.
 * @param {string} req.params.id User id.
 */
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
      return sendResponse(res, 500, "Error. Bad request when update  user's role");
    }
  });
};

/**
 * Remove admin access from user, change role to non admin
 * @param {express.Request} req Express request object.
 * @param {express.Response} res Express response object.
 * @param {string} req.params.id User id.
 */
exports.removeAdminAccessFromUser = async (req, res) => {
  try {
    const { id } = req.params;
    const dataUser = {
      role: DEFAULT_ROLE
    };

    await User.findByIdAndUpdate(id, dataUser);

    return sendResponse(res, 200, 'Successfully removed admin access from user');
  } catch (err) {
    return sendResponse(res, 500, 'Error. Bad request when remove admin access');
  }
};

/**
 * Delete user from database
 * @param {express.Request} req Express request object.
 * @param {express.Response} res Express response object.
 * @param {string} req.params.id User id.
 */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    await User.findByIdAndDelete(id);
    return sendResponse(res, 200, 'Successfully deleted user');
  } catch (err) {
    return sendResponse(res, 500, 'Error. Bad request when delete user');
  }
};

/**
 * Get all admin in DB
 * @param {express.Request} req Express request object.
 * @param {express.Response} res Express response object.
 * @param {number} req.query.page Page number.
 * @param {number} req.query.role Role code.
 * @param {string} req.query.q User query.
 */
exports.getAdmins = async (req, res) => {
  try {
    let { page } = req.query;
    const { role, q } = req.query;
    page = parseInt(page, 10) > 0 ? parseInt(page, 10) : 1;
    return await findAdmins(page, role, res, q);
  } catch (err) {
    return sendResponse(res, 500, 'Error. Bad request when get admin');
  }
};

/**
 * Get all non-admin user in DB
 * @param {express.Request} req Express request object.
 * @param {express.Response} res Express response object.
 * @param {number} req.query.page Page number.
 * @param {number} req.query.limit Limit data per page.
 */
exports.getNonAdmins = async (req, res) => {
  try {
    let { page } = req.query;
    const { limit } = req.query;
    page = parseInt(page, 10) > 0 ? parseInt(page, 10) : 1;
    const limitFilter = limit ? parseInt(limit, 10) : null;
    return await findNonAdmins(page, limitFilter, res);
  } catch (err) {
    return sendResponse(res, 500, 'Error. Bad request when get non admin');
  }
};

/**
 * Get all user role
 * @param {express.Request} req Express request object.
 * @param {express.Response} res Express response object.
 */
exports.getUserRoles = async (req, res) => {
  try {
    const [roles, totalRoles] = await Promise.all([Role.find({}), Role.countDocuments({})]);
    return sendResponse(res, 200, 'Sucessfully retrieved user role list', {
      count: totalRoles,
      data: roles
    });
  } catch (err) {
    return sendResponse(res, 500, 'Caught exception on server');
  }
};
