/**
 * Middleware that checks if the request comes from authenticated user
 * @param {object} req.session.user User object that was created by passport
 */
exports.isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  return res.json({
    apiVersion: res.locals.apiVersion,
    error: {
      code: 401,
      message: 'You are not allowed.'
    }
  });
};

/**
 * Middleware that checks if the request comes from non authenticated user
 * @param {object} req.session.user User object that was created by passport
 */
exports.isNonAuthenticated = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return next();
  }
  return res.json({
    apiVersion: res.locals.apiVersion,
    error: {
      code: 401,
      message: 'You are not allowed.'
    }
  });
};
