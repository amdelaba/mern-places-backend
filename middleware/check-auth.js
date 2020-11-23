const HttpError = require('../models/http-error');
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {

  try {
    // Headers are NOT case sensitive
    const token = req.headers.authorization.split(' ')[1];  // Authorization: 'Bearer TOKEN'
    if (!token) {
      return next(new HttpError('Authentication failed', 401));
    }
    const decodedToken = jwt.verify(token, 'super_secret_dont_share');
    req.userData = {
      userId: decodedToken.userId
    }
    next();
  } catch(err) {
    return next(new HttpError('Authentication failed', 401));
  }
 
};