exports.isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  return res.json({
    apiVersion: res.locals.apiVersion,
    error: {
      code: 401,
      message: 'You are not authenticated.'
    }
  });
};

exports.isNonAuthenticated = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return next();
  }
  return res.json({
    apiVersion: res.locals.apiVersion,
    error: {
      code: 401,
      message: 'You have been authenticated.'
    }
  });
};
