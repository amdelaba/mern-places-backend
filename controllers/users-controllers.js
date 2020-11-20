const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator')
 
const HttpError = require('../models/http-error');
const User = require('../models/user');

const DUMMY_USERS = [
  {
    id: 'u1',
    name: 'Andres',
    email: 'a@a.com',
    password: 'pass'
  }
]


const getUsers = async (req, res, next) => {

  let users;
  try {
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
  const { name, email, password, places } = req.body;
  console.log('password', password);

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch(err) {
    return next(new HttpError('Signup failed', 500));
  }

  if(existingUser) {
    return next(new HttpError('Could not create user. Email already in use', 422));
  }

  const createdUser = new User ({
    name, 
    email,
    image: 'https://storage.googleapis.com/stateless-campfire-pictures/2019/05/e4629f8e-defaultuserimage-15579880664l8pc.jpg',
    password,
    places
  });

  try {
    await createdUser.save();
  } catch(err) {
    return next(new HttpError('Something went wrong trying to signup.', 500));
  }
  
  res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let identifiedUser;
  try {
    identifiedUser = await User.findOne({ email: email });
  } catch(err) {
    return next(new HttpError('Login failed', 500));
  }

  if (!identifiedUser || identifiedUser.password !== password){
    return next(new HttpError( 'Could not identify user', 401));
  }
  res.status(200).json({ message: 'User Logged In' , identifiedUser });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;