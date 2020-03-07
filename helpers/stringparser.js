const operators = require('./operators');

/**
 * Translate query string of filter into mongoose query operator object
 * @param filterString String that matches with google standard string query string
 * that will be converted into mongoose query operator.
 */
exports.translateMongooseFilter = filterString => {
  const { list } = operators;
  let result = null;

  list.forEach(val => {
    if (filterString.includes(val)) {
      const formula = filterString.split(val);
      const formulaObject = {};
      switch (val) {
        case '==': {
          formulaObject[formula[0]] = {
            $eq: formula[1]
          };
          result = formulaObject;
          return result;
        }
        case '!=': {
          formulaObject[formula[0]] = {
            $ne: formula[1]
          };
          result = formulaObject;
          return result;
        }
        case '<': {
          formulaObject[formula[0]] = {
            $lt: formula[1]
          };
          result = formulaObject;
          return result;
        }
        case '>': {
          formulaObject[formula[0]] = {
            $gt: formula[1]
          };
          result = formulaObject;
          return result;
        }
        case '<=': {
          formulaObject[formula[0]] = {
            $lte: formula[1]
          };
          result = formulaObject;
          return result;
        }
        case '>=': {
          formulaObject[formula[0]] = {
            $gte: formula[1]
          };
          result = formulaObject;
          return result;
        }
        case '=@': {
          formulaObject[formula[0]] = {
            $regex: formula[1],
            $options: 'i'
          };
          result = formulaObject;
          return result;
        }
        case '!@': {
          formulaObject[formula[0]] = {
            $not: {
              $ne: formula[1]
            }
          };
          result = formulaObject;
          return result;
        }
        default:
          return result;
      }
    }
  });
  return result;
};

/**
 * Match query string based on Google Filters Standard
 * @param filtersQueryString
 */
exports.translateFiltersMongoose = filtersQueryString => {
  const orArray = filtersQueryString.split(',').map(val => {
    return val.split(';');
  });

  const filterArray = orArray.map(andArray => {
    const translatedArray = andArray.map(val => {
      return this.translateMongooseFilter(val);
    });
    return {
      $and: translatedArray || []
    };
  });

  return {
    $or: filterArray
  };
};
