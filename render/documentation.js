const swaggerJSDoc = require('swagger-jsdoc');
const pathToSwaggerUi = require('swagger-ui-dist').absolutePath();
const fs = require('fs');

const swaggerConfig = require('../config/swagger.json');

exports.getSwaggerConfiguration = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerJSDoc(swaggerConfig));
};

exports.getIndexContent = (req, res) => {
  let indexContent = fs.readFileSync(`${pathToSwaggerUi}/index.html`).toString();
  if (process.env.NODE_ENV === 'development') {
    indexContent = indexContent.replace(
      'https://petstore.swagger.io/v2/swagger.json',
      `http://localhost:${process.env.PORT || 3000}/documentation/v1/swagger.json`
    );
  } else if (process.env.NODE_ENV === 'staging') {
    indexContent = indexContent.replace(
      'https://petstore.swagger.io/v2/swagger.json',
      `${process.env.BASE_URL}/documentation/v1/swagger.json`
    );
  }
  res.send(indexContent);
};
