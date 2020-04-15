const express = require('express');
const { isAuthenticated, isNonAuthenticated } = require('../middlewares/user');
const {
  signInSSO,
  postSignout,
  getUsers,
  deleteUser,
  removeAdminAccessFromUser,
  updateUserRole,
  getUserDetail,
  searchUser,
  getAdmins,
  getNonAdmins
} = require('../handlers/user');
const {
  isAuthArchive,
  searchArchive,
  latestArchive,
  getArchiveDetail,
  getArchiveTitle,
  postUploadArchive,
  patchEditArchive,
  putEditArchive,
  deleteArchive,
  uploadAudio,
  uploadPhoto,
  uploadText,
  uploadVideo,
  downloadArchive,
  getStatistic,
  postNewBorrowRequest
} = require('../handlers/archive');

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
 *       400:
 *         description: "Bad request"
 *       401:
 *         description: "Not authenticated"
 *       404:
 *         description: "Not found"
 *       500:
 *         description: "Caught exception on server"
 */
r.get('/auth/signin', isNonAuthenticated, signInSSO);

/**
 * @swagger
 *
 * /api/v1/auth/signout:
 *   post:
 *     summary: "Sign out user from application"
 *     description: "Removing user session from database"
 *     tags:
 *     - "auth"
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: "Success operation"
 *       400:
 *         description: "Bad request"
 *       401:
 *         description: "Not authenticated"
 *       404:
 *         description: "Not found"
 *       500:
 *         description: "Caught exception on server"
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
 *       400:
 *         description: "Bad request"
 *       401:
 *         description: "Not authenticated"
 *       404:
 *         description: "Not found"
 *       500:
 *         description: "Caught exception on server"
 */
r.get('/auth/check', isAuthenticated, (req, res) => {
  const { user } = req.session;
  res.json({ data: user });
});

/**
 * @swagger
 *
 * /api/v1/search:
 *   get:
 *     summary: "Search archive by query"
 *     tags:
 *     - "archive"
 *     description: "Retrieve archive that it's data relevant with the query"
 *     produces:
 *     - application/json
 *     parameters:
 *       - name: "q"
 *         in: "query"
 *         required: true
 *         description: "query"
 *         type: "string"
 *       - name: "page"
 *         in: "query"
 *         required: false
 *         description: "page number"
 *     responses:
 *       200:
 *         description: "Success operation"
 *       400:
 *         description: "Bad request"
 *       401:
 *         description: "Not authenticated"
 *       404:
 *         description: "Not found"
 *       500:
 *         description: "Caught exception on server"
 */
r.get('/search', searchArchive);

r.get('/archive/latest', latestArchive);

/**
 * @swagger
 *
 * /api/v1/detail:
 *   get:
 *     summary: "Get archive detail by id"
 *     tags:
 *     - "archive"
 *     description: "Retrieve archive data with id provided in url parameter"
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
 *       404:
 *         description: "Not found"
 *       500:
 *         description: "Caught exception on server"
 */
r.get('/detail/:id', isAuthArchive, getArchiveDetail);

r.get('/archive/title/:id', getArchiveTitle);

/**
 * @swagger
 *
 * /api/v1/upload:
 *   post:
 *     summary: "Upload new archive"
 *     tags:
 *     - "archive"
 *     description: "Upload new archive based on form fields"
 *     produces:
 *     - application/json
 *     parameters:
 *       - in: body
 *         name: archive
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *              judul:
 *                description: test
 *                type: string
 *              tipe:
 *                type: string
 *              nomor:
 *                type: string
 *              pola:
 *                type: string
 *              lokasi_kegiatan:
 *                type: string
 *              keterangan:
 *                type: string
 *              waktu_kegiatan:
 *                type: string
 *              keamanan_terbuka:
 *                type: boolean
 *              lokasi_simpan_arsip:
 *                type: string
 *              mime:
 *                type: string
 *       - in: formData
 *         name: filetoupload
 *         type: file
 *         description: The file to upload
 *         required: true
 *     responses:
 *       200:
 *         description: "Success operation"
 *       400:
 *         description: "Bad request"
 *       401:
 *         description: "Not authenticated"
 *       404:
 *         description: "Not found"
 *       500:
 *         description: "Caught exception on server"
 */
r.post('/upload', postUploadArchive);

/**
 * @swagger
 *
 * /api/v1/edit:
 *   patch:
 *     summary: "Update archive by id"
 *     tags:
 *     - "archive"
 *     description: "Update archive with provided id"
 *     produces:
 *     - application/json
 *     parameters:
 *       - name: "id"
 *         in: "path"
 *         required: "true"
 *         description: "archive id"
 *         type: "string"
 *       - in: body
 *         name: archive
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *              judul:
 *                description: test
 *                type: string
 *              tipe:
 *                type: string
 *              nomor:
 *                type: string
 *              pola:
 *                type: string
 *              lokasi_kegiatan:
 *                type: string
 *              keterangan:
 *                type: string
 *              waktu_kegiatan:
 *                type: string
 *              keamanan_terbuka:
 *                type: boolean
 *              lokasi_simpan_arsip:
 *                type: string
 *              mime:
 *                type: string
 *     responses:
 *       200:
 *         description: "Success operation"
 *       400:
 *         description: "Bad request"
 *       401:
 *         description: "Not authenticated"
 *       404:
 *         description: "Not found"
 *       500:
 *         description: "Caught exception on server"
 */
r.patch('/edit/:id', patchEditArchive);

/**
 * @swagger
 *
 * /api/v1/edit:
 *   put:
 *     summary: "Replace archive by id"
 *     tags:
 *     - "archive"
 *     description: "Replace archive with new provided data"
 *     produces:
 *     - application/json
 *     parameters:
 *       - name: "id"
 *         in: "path"
 *         required: true
 *         description: "archive id"
 *         type: "string"
 *       - in: body
 *         name: archive
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *              judul:
 *                description: test
 *                type: string
 *              tipe:
 *                type: string
 *              nomor:
 *                type: string
 *              pola:
 *                type: string
 *              lokasi_kegiatan:
 *                type: string
 *              keterangan:
 *                type: string
 *              waktu_kegiatan:
 *                type: string
 *              keamanan_terbuka:
 *                type: boolean
 *              lokasi_simpan_arsip:
 *                type: string
 *              mime:
 *                type: string
 *       - in: formData
 *         name: filetoupload
 *         type: file
 *         description: The file to upload
 *         required: true
 *     responses:
 *       200:
 *         description: "Success operation"
 *       400:
 *         description: "Bad request"
 *       401:
 *         description: "Not authenticated"
 *       404:
 *         description: "Not found"
 *       500:
 *         description: "Caught exception on server"
 */
r.put('/edit/:id', putEditArchive);

/**
 * @swagger
 *
 * /api/v1/delete:
 *   delete:
 *     summary: "Delete archive by id"
 *     tags:
 *     - "archive"
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
 *       404:
 *         description: "Not found"
 *       500:
 *         description: "Caught exception on server"
 */
// eslint-disable-next-line
r.delete('/delete/:id', deleteArchive);

/**
 * @swagger
 *
 * /api/v1/download:
 *   get:
 *     summary: "Download archive by id"
 *     tags:
 *     - "archive"
 *     description: "Download file of an archive by id"
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
 *       404:
 *         description: "Not found"
 *       500:
 *         description: "Caught exception on server"
 */
r.get('/archive/download/:id', isAuthArchive, downloadArchive);

/**
 * @swagger
 *
 * /api/v1/users:
 *   get:
 *     summary: "Get all users"
 *     tags:
 *     - "archive"
 *     description: "Get all users data available in database"
 *     produces:
 *     - application/json
 *     responses:
 *       200:
 *         description: "Success operation"
 *       400:
 *         description: "Bad request"
 *       401:
 *         description: "Not authenticated"
 *       404:
 *         description: "Not found"
 *       500:
 *         description: "Caught exception on server"
 */
r.get('/users', getUsers);

/**
 * @swagger
 *
 * /api/v1/admins:
 *   get:
 *     summary: "Get all admin or by admin role"
 *     tags:
 *     - "archive"
 *     description: "Get admins data available in database"
 *     produces:
 *     - application/json
 *     parameters:
 *       - name: "role"
 *         in: "query"
 *         required: "false"
 *         description: "admin role ID (not role name)"
 *         type: "number"
 *       - name: "page"
 *         in: "query"
 *         required: "false"
 *         description: "requested page number"
 *     responses:
 *       200:
 *         description: "Success operation"
 *       400:
 *         description: "Bad request"
 *       401:
 *         description: "Not authenticated"
 *       404:
 *         description: "Not found"
 *       500:
 *         description: "Caught exception on server"
 */
r.get('/admins', getAdmins);

/**
 * @swagger
 *
 * /api/v1/non-admins:
 *   get:
 *     summary: "Get all user that's not given admin access"
 *     tags:
 *     - "archive"
 *     description: "Get admins data available in database"
 *     produces:
 *     - application/json
 *     parameters:
 *       - name: "page"
 *         in: "query"
 *         required: "false"
 *         description: "requested page number"
 *     responses:
 *       200:
 *         description: "Success operation"
 *       400:
 *         description: "Bad request"
 *       401:
 *         description: "Not authenticated"
 *       404:
 *         description: "Not found"
 *       500:
 *         description: "Caught exception on server"
 */
r.get('/non-admins', getNonAdmins);

/**
 * @swagger
 *
 * /api/v1/user-search:
 *   get:
 *     summary: "Search users"
 *     tags:
 *     - "user"
 *     description: "Search users by name/mail with query and page number"
 *     produces:
 *     - application/json
 *     parameters:
 *       - name: "q"
 *         in: "query"
 *         required: "true"
 *         description: "query"
 *         type: "string"
 *       - name: "page"
 *         in: "query"
 *         required: "false"
 *         description: "page number"
 *     responses:
 *       200:
 *         description: "Success operation"
 *       400:
 *         description: "Bad request"
 *       401:
 *         description: "Not authenticated"
 *       404:
 *         description: "Not found"
 *       500:
 *         description: "Caught exception on server"
 */
r.get('/user-search', searchUser);

/**
 * @swagger
 *
 * /api/v1/users:
 *   get:
 *     summary: "Get user detail by id"
 *     tags:
 *     - "user"
 *     description: "Retrieve user data with id provided in url parameter"
 *     produces:
 *     - application/json
 *     parameters:
 *       - name: "id"
 *         in: "path"
 *         required: "true"
 *         description: "user id"
 *         type: "string"
 *     responses:
 *       200:
 *         description: "Success operation"
 *       400:
 *         description: "Bad request"
 *       401:
 *         description: "Not authenticated"
 *       404:
 *         description: "Not found"
 *       500:
 *         description: "Caught exception on server"
 */
r.get('/users/:id', getUserDetail);

/**
 * @swagger
 *
 * /api/v1/users:
 *   patch:
 *     summary: "Update user by id"
 *     tags:
 *     - "user"
 *     description: "Update user with provided id"
 *     produces:
 *     - application/json
 *     parameters:
 *       - name: "id"
 *         in: "path"
 *         required: "true"
 *         description: "user id"
 *         type: "string"
 *       - in: body
 *         name: role
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *              role:
 *                type: integer
 *     responses:
 *       200:
 *         description: "Success operation"
 *       400:
 *         description: "Bad request"
 *       401:
 *         description: "Not authenticated"
 *       404:
 *         description: "Not found"
 *       500:
 *         description: "Caught exception on server"
 */
r.patch('/users/:id', updateUserRole);

/**
 * @swagger
 *
 * /api/v1/remove-admin:
 *   patch:
 *     summary: "Remove admin priviledges by user id"
 *     tags:
 *     - "user"
 *     description: "Remove admin priviledges by user id"
 *     produces:
 *     - application/json
 *     parameters:
 *       - name: "id"
 *         in: "path"
 *         required: "true"
 *         description: "user id"
 *         type: "string"
 *     responses:
 *       200:
 *         description: "Success operation"
 *       400:
 *         description: "Bad request"
 *       401:
 *         description: "Not authenticated"
 *       404:
 *         description: "Not found"
 *       500:
 *         description: "Caught exception on server"
 */
r.patch('/remove-admin/:id', removeAdminAccessFromUser);

// eslint-disable-next-line
r.delete('/users/:id', deleteUser);

/**
 * @swagger
 *
 * /api/v1/statistic:
 *   get:
 *     summary: "Get number of archives and users on the database"
 *     tags:
 *     - "user"
 *     description: "Get number of archives and users on the database"
 *     produces:
 *     - application/json
 *     responses:
 *       200:
 *         description: "Success operation"
 *       400:
 *         description: "Bad request"
 *       401:
 *         Unauthorized request
 */
r.get('/statistic', getStatistic);

/*
 * Routes for testing pages
 */
r.get('/upload/audio', uploadAudio);
r.get('/upload/photo', uploadPhoto);
r.get('/upload/text', uploadText);
r.get('/upload/video', uploadVideo);

r.post('/archive/borrow', isAuthenticated, postNewBorrowRequest);

module.exports = r;
