const HttpError = require('../models/http-error');
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {

  try {
    // OPTIONS requests get sent by browser to see if server allows the request 
    // It has not 'Authorization' header so we need to handle it
    // Here we just ignore them
    if (req.method === 'OPTIONS') {
      return next();
    }
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