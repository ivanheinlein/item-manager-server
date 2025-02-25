const jwt = require('jsonwebtoken');
const ApiError = require('../errors/ApiError');

module.exports = (req, res, next) => {
  if (req.method === 'OPTIONS') next();
  const errorMessage = 'User unauthorized';

  try {
    const token = req.headers.authorization.split(' ')[1];

    if (!token) return next(ApiError.unauthorization(errorMessage));

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded;

    next();
  } catch (e) {
    return next(ApiError.unauthorization(errorMessage));
  }
};
