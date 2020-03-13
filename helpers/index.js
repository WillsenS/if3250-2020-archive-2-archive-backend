const operators = require('./operators');
const stringparser = require('./stringparser');
const modelsaver = require('./modelsaver');

module.exports = {
  ...operators,
  ...stringparser,
  ...modelsaver
};
