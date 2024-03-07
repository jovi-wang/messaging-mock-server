export const notFoundErrorHandler = (req, res, next) => {
  const validBaseUrl = ['/'];
  const baseUrl = req.originalUrl.split('?')[0];
  if (!validBaseUrl.includes(baseUrl)) {
    next({
      status: 404,
      error: {
        code: 'RESOURCE_NOT_FOUND',
        value: baseUrl,
      },
    });
  } else {
    next();
  }
};

export const verifyRequestMethod = (req, res, next) => {
  if (req.method !== 'POST' && req.method !== 'GET') {
    next({
      status: 405,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        value: req.method,
      },
    });
  } else {
    next();
  }
};
