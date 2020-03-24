const operators = require('./operators');
const stringparser = require('./stringparser');

module.exports = {
  ...operators,
  ...stringparser
};
