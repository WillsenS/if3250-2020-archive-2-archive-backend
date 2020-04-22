const express = require('express');
const { isAuthenticated, isNonAuthenticated } = require('../middlewares/user');
const { isAuthArchive } = require('../middlewares/achive');
const {
  signInSSO,
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
  getMostSearchKeywordOnFile,
  changeMostSearchKeywordOnFile,
  getMostSearchKeyword,
  searchArchive,
  latestArchive,
  getArchiveDetail,
  getArchiveTitle,
  postUploadArchive,
  patchEditArchive,
  putEditArchive,
  deleteArchive,
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
 * /api/v1/keyword/most:
 *   get:
 *     summary: "Get most search keyword"
 *     tags:
 *     - "archive"
 *     description: "Retrieve 10 most search keyword"
 *     produces:
 *     - application/json
 *     responses:
 *       200:
 *         description: "Success operation"
 *       400:
 *         description: "Bad request"
 *       404:
 *         description: "Not found"
 *       500:
 *         description: "Caught exception on server"
 */
r.get('/archive/search/most', getMostSearchKeyword);

r.get('/keyword/most', getMostSearchKeywordOnFile);

r.patch('/keyword/most', changeMostSearchKeywordOnFile);

/**
 * @swagger
 *
 * /api/v1/archive/search:
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
 *       404:
 *         description: "Not found"
 *       500:
 *         description: "Caught exception on server"
 */
r.get('/archive/search', searchArchive);

/**
 * @swagger
 *
 * /api/v1/archive/latest:
 *   get:
 *     summary: "Show latest archive"
 *     tags:
 *     - "archive"
 *     description: "Show 5 latest public archive"
 *     produces:
 *     - application/json
 *     parameters:
 *     responses:
 *       200:
 *         description: "Success operation"
 *       400:
 *         description: "Bad request"
 *       404:
 *         description: "Not found"
 *       500:
 *         description: "Caught exception on server"
 */
r.get('/archive/latest', latestArchive);

/**
 * @swagger
 *
 * /api/v1/archive/detail/{id}:
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
r.get('/archive/detail/:id', isAuthArchive, getArchiveDetail);

/**
 * @swagger
 *
 * /api/v1/archive/title/{id}:
 *   get:
 *     summary: "Get archive title by id"
 *     tags:
 *     - "archive"
 *     description: "Retrieve archive title by id given"
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
 *       404:
 *         description: "Not found"
 *       500:
 *         description: "Caught exception on server"
 */
r.get('/archive/title/:id', getArchiveTitle);

/**
 * @swagger
 *
 * /api/v1/archive/borrow:
 *   post:
 *     summary: "Upload new request to borrow archive"
 *     tags:
 *     - "archive"
 *     description: "Upload new borrow archive request based on form fields"
 *     produces:
 *     - application/json
 *     parameters:
 *       - in: body
 *         name: borrow
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *              archive:
 *                description: test
 *                type: string
 *              borrower:
 *                type: string
 *              phone:
 *                type: string
 *              email:
 *                type: string
 *              reason:
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
r.post('/archive/borrow', isAuthenticated, postNewBorrowRequest);

/**
 * @swagger
 *
 * /api/v1/archive/upload:
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
r.post('/archive/upload', postUploadArchive);

/**
 * @swagger
 *
 * /api/v1/archive/edit:
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
r.patch('/archive/edit/:id', patchEditArchive);

/**
 * @swagger
 *
 * /api/v1/archive/edit:
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
r.put('/archive/edit/:id', putEditArchive);

/**
 * @swagger
 *
 * /api/v1/archive/delete:
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
r.delete('/archive/delete/:id', deleteArchive);

/**
 * @swagger
 *
 * /api/v1/archive/download:
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
 *     summary: "Get all admin or search admin by query"
 *     tags:
 *     - "user"
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
 *       - name: "q"
 *         in: "query"
 *         required: "false"
 *         description: "query"
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
r.get('/admins', getAdmins);

/**
 * @swagger
 *
 * /api/v1/non-admins:
 *   get:
 *     summary: "Get all user that's not given admin access"
 *     tags:
 *     - "user"
 *     description: "Get admins data available in database"
 *     produces:
 *     - application/json
 *     parameters:
 *       - name: "limit"
 *         in: "query"
 *         required: "false"
 *         description: "limit result response"
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
 * /api/v1/users/search:
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
r.get('/users/search', searchUser);

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

module.exports = r;
