const express = require('express');
const { isAuthenticated, isNonAuthenticated } = require('../middlewares/user');
const {
  signInSSO,
  postSignout,
  getUsers,
  deleteUser,
  patchEditUser,
  getUserDetail
} = require('../handlers/user');
const {
  searchDocument,
  getArchiveDetail,
  uploadArchive,
  postUploadArchive,
  patchEditArchive,
  deleteArchive
} = require('../handlers/document');

const r = express.Router();

r.get('/', isAuthenticated, (req, res) => {
  res.json({
    apiVersion: res.locals.apiVersion,
    message: 'Server is up and running'
  });
});

/**
 * @swagger
 * /api/v1/auth/signin:
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
 * /api/v1/auth/signout:
 *   post:
 *     summary: "Make user out from application"
 *     description: "Removing user session from database"
 *     tags:
 *     - "auth"
 *     produces:
 *       - application/json
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
 * /api/v1/auth/check:
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
 * /api/v1/search:
 *   get:
 *     summary: "Search document by query"
 *     tags:
 *     - "document"
 *     description: "Retrieve document that it's data relevant with the query"
 *     produces:
 *     - application/json
 *     parameters:
 *       - name: "q"
 *         in: "query"
 *         required: "true"
 *         description: "query"
 *         type: "string"
 *     responses:
 *       200:
 *         description: "Success operation"
 *       400:
 *         description: "Bad request"
 *       401:
 *         description: "Not authenticated"
 *       500:
 *         description: "Caught exception on server"
 */
r.get('/search', searchDocument);

/**
 * @swagger
 *
 * /api/v1/detail:
 *   get:
 *     summary: "Get archive detail by id"
 *     tags:
 *     - "document"
 *     description: "Retrieve data with id provided in url parameter"
 *     produces:
 *     - application/json
 *     parameters:
 *       - name: "id"
 *         in: "path"
 *         required: "true"
 *         description: "archive id"
 *         type: "string"
 *     responses:
 *       200:
 *         description: "Success operation"
 *       400:
 *         description: "Bad request"
 *       401:
 *         description: "Not authenticated"
 *       500:
 *         description: "Caught exception on server"
 */
r.get('/detail/:id', getArchiveDetail);

/**
 * @swagger
 *
 * /api/v1/upload:
 *   post:
 *     summary: "Search document by query"
 *     tags:
 *     - "document"
 *     description: "Retrieve document that it's data relevant with the query"
 *     produces:
 *     - application/json
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *           type: object
 *           properties:
 *             code:
 *               type: string
 *             title:
 *               type: string
 *             description:
 *               type: string
 *             location:
 *               type: string
 *           required:
 *             -  code
 *             -  title
 *             -  description
 *             -  location
 *
 *     responses:
 *       200:
 *         description: "Success operation"
 *       400:
 *         description: "Bad request"
 *       401:
 *         description: "Not authenticated"
 *       500:
 *         description: "Caught exception on server"
 */
r.post('/upload', postUploadArchive);

/**
 * @swagger
 *
 * /api/v1/edit:
 *   patch:
 *     summary: "Search document by query"
 *     tags:
 *     - "document"
 *     description: "Retrieve document that it's data relevant with the query"
 *     produces:
 *     - application/json
 *     parameters:
 *       - name: "id"
 *         in: "path"
 *         required: "true"
 *         description: "archive id"
 *         type: "string"
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *           type: object
 *           properties:
 *             code:
 *               type: string
 *             title:
 *               type: string
 *             description:
 *               type: string
 *             location:
 *               type: string
 *           required:
 *             -  code
 *             -  title
 *             -  description
 *             -  location
 *     responses:
 *       200:
 *         description: "Success operation"
 *       400:
 *         description: "Bad request"
 *       401:
 *         description: "Not authenticated"
 *       500:
 *         description: "Caught exception on server"
 */
r.patch('/edit/:id', patchEditArchive);

/**
 * @swagger
 *
 * /api/v1/delete:
 *   delete:
 *     summary: "Delete document by id"
 *     tags:
 *     - "document"
 *     description: "Delete archive with id prodived in request parameter"
 *     produces:
 *     - application/json
 *     parameters:
 *       - name: "id"
 *         in: "path"
 *         required: "true"
 *         description: "archive id"
 *         type: "string"
 *     responses:
 *       200:
 *         description: "Success operation"
 *       400:
 *         description: "Bad request"
 *       401:
 *         description: "Not authenticated"
 *       500:
 *         description: "Caught exception on server"
 */
// eslint-disable-next-line
r.delete('/delete/:id', deleteArchive);

r.get('/users', getUsers);

r.get('/users/:id', getUserDetail);

r.patch('/users/:id', patchEditUser);

// eslint-disable-next-line
r.delete('/users/:id', deleteUser);

/*
 * Routes for testing pages
 */
r.get('/upload', uploadArchive);

module.exports = r;
