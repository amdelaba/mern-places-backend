const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
// const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');
 
const HttpError = require('../models/http-error');
const User = require('../models/user');

const getUsers = async (req, res, next) => {

  let users;
  try {
    // user protection to leave out password (we dont want to send that back)
    users = await User.find({}, '-password');
  } catch(err) {
    return next(new HttpError('Something went wrong fetching users from db', 500));
  }
  res.status(200).json({ users: users.map(u => u.toObject({ getters: true })) });
}; 

const signup = async (req, res, next) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()){
    console.log(errors);
    return next(new HttpError('Invalid inputs', 422));
  }
  const { name, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch(err) {
    return next(new HttpError('Signup failed', 500));
  }

  if(existingUser) {
    return next(new HttpError('Could not create user. Email already in use', 422));
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12)
  } catch(err) {
    const error = new HttpError(
      'Hashing password failed.',
      500
    );
    return next(error);
  }

  const createdUser = new User ({
    name, 
    email,
    image: req.file.path,
    password: hashedPassword,
    places: []
  });

  try {
    await createdUser.save();
  } catch(err) {
    return next(new HttpError('Something went wrong trying to signup.', 500));
  }

  let token;
  try {
    token = await jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      process.env.JWT_KEY,
      { expiresIn: '1h' }   // config options
    );
  } catch(error) {
    return next(new HttpError('Signup error: JWT generation failed', 500));
  }
  
  res.status(201).json({ userId: createdUser.id, email: createdUser.email, token });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let identifiedUser;
  try {
    identifiedUser = await User.findOne({ email: email });
  } catch(err) {
    return next(new HttpError('Login error: Cannot find user in db', 500));
  }

  if (!identifiedUser) {
    return next(new HttpError('Login error: Cannot identify user', 401));
  }

  let isValidPassword = false;

  try {
    isValidPassword = await bcrypt.compare(password, identifiedUser.password);  // existingUser.password is hashed 
  } catch(err){
    return next(new HttpError('Login failed, bcrypt compare failed', 500));
  }

  if (!isValidPassword) {
    return next(new HttpError('Login failed, invalid password', 403));
  }

  let token;
  try {
    token = await jwt.sign(
      { userId: identifiedUser.id, email: identifiedUser.email },
      process.env.JWT_KEY,
      { expiresIn: '1h' }   // config options
    );
  } catch(error) {
    return next(new HttpError('Login error: JWT generation failed', 500));
  }

  res.status(201).json({ userId: identifiedUser.id, email: identifiedUser.email, token });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;