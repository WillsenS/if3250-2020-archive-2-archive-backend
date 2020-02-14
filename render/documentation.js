const swaggerJSDoc = require('swagger-jsdoc');
const pathToSwaggerUi = require('swagger-ui-dist').absolutePath();
const fs = require('fs');

const swaggerConfig = require('../config/swagger.json');

exports.getSwaggerConfiguration = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerJSDoc(swaggerConfig));
};

exports.getIndexContent = (req, res) => {
  const indexContent = fs
    .readFileSync(`${pathToSwaggerUi}/index.html`)
    .toString()
    .replace(
      'https://petstore.swagger.io/v2/swagger.json',
      `http://localhost:${process.env.PORT || 3000}/documentation/v1/swagger.json`
    );
  res.send(indexContent);
};
