/* eslint-disable dot-notation */
const axios = require('axios');
const convert = require('xml-js');
const User = require('../models/User');

const { defaultURL } = require('../config');

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

        console.log(response);

        const result = await JSON.parse(
          convert.xml2json(response.data, { compact: true, spaces: 4 })
        );
        const serviceResponse = result['cas:serviceResponse'];

        if (
          serviceResponse['cas:authenticationFailure'] &&
          serviceResponse['cas:authenticationFailure']['_attributes'] &&
          serviceResponse['cas:authenticationFailure']['_attributes']['code'] === 'INVALID_TICKET'
        ) {
          return res.redirect(`https://login.itb.ac.id/cas/login?service=${defaultURL}`);
        }

        const successResponse = serviceResponse['cas:authenticationSuccess'];
        const username = successResponse['cas:user']['_text'];
        const foundUser = await User.findOne({ username });

        if (!foundUser) {
          const successAttributes = successResponse['cas:attributes'];
          const fullname = successAttributes['cas:cn']['_text'];
          const mail = successAttributes['cas:mail']['_text'];
          const mailNonITB = successAttributes['cas:itbEmailNonITB']['_text'];
          const ou = successAttributes['cas:ou']['_text'];
          const status = successAttributes['cas:itbStatus']['_text'];

          const userData = {
            username,
            fullname,
            mail,
            mailNonITB,
            ou,
            status
          };
          const newUser = new User(userData);
          await newUser.save();
          req.session.user = newUser;
        } else {
          req.session.user = foundUser;
        }

        return res.json({
          apiVersion: res.locals.apiVersion,
          username
        });
      } catch (err) {
        console.error(err);
        return res.status(500).json({
          apiVersion: res.locals.apiVersion,
          error: {
            code: 500,
            message: 'Error occured during sign in process'
          }
        });
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
        return res.status(500).json({
          apiVersion: res.locals.apiVersion,
          error: {
            code: 500,
            message: 'Error occured during signing out process'
          }
        });
      }

      req.session.user = null;
      return res.json({
        apiVersion: res.locals.apiVersion,
        message: 'Successfully logged out'
      });
    });
  } catch (e) {
    console.error(`User could not log out: ${e.message}`);
    return res.status(500).json({
      apiVersion: res.locals.apiVersion,
      error: {
        code: 500,
        message: 'Error occured during signing out process'
      }
    });
  }
};
