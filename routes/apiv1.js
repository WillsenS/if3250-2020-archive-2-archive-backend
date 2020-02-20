const express = require('express');
const { isAuthenticated, isNonAuthenticated } = require('../middlewares/user');
const { signInSSO, postSignout } = require('../handlers/user');
const { searchDocument } = require('../handlers/document');

const r = express.Router();

r.get('/', isAuthenticated, (req, res) => {
  res.json({
    apiVersion: res.locals.apiVersion,
    message: 'Server is up and running'
  });
});

/**
 * @swagger
 * /auth/signin:
 *   get:
 *     summary: "Sign a user into application"
 *     tags:
 *     - "auth"
 *     description: "Sign a user into application with SSO ITB"
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: "Success operation"
 *       401:
 *         description: "Not authenticated"
 *       500:
 *         description: "Caught exception on server"
 */
r.get('/auth/signin', isNonAuthenticated, signInSSO);

/**
 * @swagger
 *
 * /auth/signout:
 *   post:
 *     summary: "Make user out from application"
 *     description: "Removing user session from database"
 *     tags:
 *     - "auth"
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: "token"
 *         in: "body"
 *         required: "true"
 *         description: "Firebase token"
 *         type: "string"
 *     responses:
 *       200:
 *         description: "Successfully logged out"
 *       401:
 *         description: "Not authenticated"
 *       500:
 *         description: "Error happened during logging out"
 */
r.post('/auth/signout', isAuthenticated, postSignout);

/**
 * @swagger
 *
 * /auth/check:
 *   get:
 *     summary: "Check if user is authenticated or not"
 *     tags:
 *     - "auth"
 *     description: "Check if user's cookie is authenticated or not"
 *     produces:
 *     - application/json
 *     responses:
 *       200:
 *         description: "Success operation"
 *       401:
 *         description: "Not authenticated"
 *       500:
 *         description: "Caught exception on server"
 */
r.get('/auth/check', isAuthenticated, (req, res) => {
  const { user } = req.session;
  res.json(user);
});

/**
 * @swagger
 *
 * /search:
 *   get:
 *     summary: "Search document by query"
 *     tags:
 *     - "document"
 *     description: "Retrieve document that it's data relevant with the query"
 *     produces:
 *     - application/json
 *     responses:
 *       200:
 *         description: "Success operation"
 *       401:
 *         description: "Not authenticated"
 *       500:
 *         description: "Caught exception on server"
 */
r.get('/search', searchDocument);

module.exports = r;
