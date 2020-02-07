const express = require('express');

const r = express.Router();

r.get('/', (req, res) =>
  res.json({
    apiVersion: res.locals.apiVersion,
    message: 'Server is up and running'
  })
);

module.exports = r;
