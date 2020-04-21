const express = require('express');
const pathToSwaggerUi = require('swagger-ui-dist').absolutePath();

const { getSwaggerConfiguration, getIndexContent } = require('../render/documentation');

const r = express.Router();

r.get('/swagger.json', getSwaggerConfiguration);
r.get('/index.html', getIndexContent);
r.use('/', express.static(pathToSwaggerUi));
r.get('/', getIndexContent);

module.exports = r;
