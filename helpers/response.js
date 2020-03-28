exports.sendResponse = (res, status, message, payload) => {
  const jsonResponse = {
    apiVersion: res.locals.apiVersion,
    message
  };

  if (status >= 400) {
    jsonResponse.error = {
      code: status
    };
  }

  if (payload) {
    Object.keys(payload).forEach(key => {
      jsonResponse[key] = payload[key];
    });
  }

  return res.status(status).json(jsonResponse);
};
