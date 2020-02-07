exports.setApiVersion = stringNumber => {
  return (req, res, next) => {
    res.locals.apiVersion = stringNumber;
    next();
  };
};
