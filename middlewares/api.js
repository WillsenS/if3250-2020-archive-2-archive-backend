/**
 * Middleware for setting the version of the api standard.
 * @param stringNumber Number of the current version of the api
 */
exports.setApiVersion = stringNumber => {
  return (req, res, next) => {
    res.locals.apiVersion = stringNumber;
    next();
  };
};
