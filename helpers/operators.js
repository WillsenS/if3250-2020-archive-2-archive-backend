const { isInt } = require('validator');

/**
 * Compare between operators based on google filter standard
 */
module.exports = {
  // List of available operators,
  list: ['=@', '!@', '==', '!=', ',', ';', '<', '>', '<=', '>='],
  // Contain substring
  '=@': (first, second) => {
    if (typeof first === 'string' && typeof second === 'string') {
      if (first.includes(second)) {
        return true;
      }
      return false;
    }
    return false;
  },
  // Not Contain substring
  '!@': (first, second) => {
    if (typeof first === 'string' && typeof second === 'string') {
      if (first.includes(second)) {
        return false;
      }
      return true;
    }
    return true;
  },
  // Equal operator
  '==': (first, second) => {
    return first == second;
  },
  // Not equeal operator
  '!=': (first, second) => {
    return first != second;
  },
  // Or operator
  ',': (first, second) => {
    return first || second;
  },
  // And operator
  ';': (first, second) => {
    return first && second;
  },
  // Less operator
  '<': (first, second) => {
    let firstArgument = first;
    if (typeof first !== 'number' && isInt(first)) {
      firstArgument = parseInt(first, 10);
    }
    let secondArgument = second;
    if (typeof second !== 'number' && isInt(second)) {
      secondArgument = parseInt(second, 10);
    }
    return firstArgument < secondArgument;
  },
  // Greater operator
  '>': (first, second) => {
    let firstArgument = first;
    if (typeof first !== 'number' && isInt(first)) {
      firstArgument = parseInt(first, 10);
    }
    let secondArgument = second;
    if (typeof second !== 'number' && isInt(second)) {
      secondArgument = parseInt(second, 10);
    }
    return firstArgument > secondArgument;
  },
  // Less than equal operator
  '<=': (first, second) => {
    let firstArgument = first;
    if (typeof first !== 'number' && isInt(first)) {
      firstArgument = parseInt(first, 10);
    }
    let secondArgument = second;
    if (typeof second !== 'number' && isInt(second)) {
      secondArgument = parseInt(second, 10);
    }
    return firstArgument <= secondArgument;
  },
  // Greaer than equal operator
  '>=': (first, second) => {
    let firstArgument = first;
    if (typeof first !== 'number' && isInt(first)) {
      firstArgument = parseInt(first, 10);
    }
    let secondArgument = second;
    if (typeof second !== 'number' && isInt(second)) {
      secondArgument = parseInt(second, 10);
    }
    return firstArgument >= secondArgument;
  }
};
