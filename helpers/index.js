const operators = require('./operators');
const stringparser = require('./stringparser');
const modelsaver = require('./modelsaver');
const response = require('./response');

module.exports = {
  ...operators,
  ...stringparser,
  ...modelsaver,
  ...response
};
