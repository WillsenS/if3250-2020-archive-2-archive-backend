const express = require('express');
const { isAuthenticated, isNonAuthenticated } = require('../middlewares/user');
const { signInSSO, postSignout } = require('../handlers/user');

const r = express.Router();

r.get('/', isAuthenticated, (req, res) => {
  res.json({
    apiVersion: res.locals.apiVersion,
    message: 'Server is up and running'
  });
});

r.get('/auth/signin', isNonAuthenticated, signInSSO);
r.get('/auth/signout', isAuthenticated, postSignout);
r.get('/auth/check', isAuthenticated, (req, res) => {
  const { user } = req.session;
  res.json(user);
});

module.exports = r;
