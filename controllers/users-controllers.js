const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator')
 
const HttpError = require('../models/http-error');

const DUMMY_USERS = [
  {
    id: 'u1',
    name: 'Andres',
    email: 'a@a.com',
    password: 'pass'
  }
]


const getUsers = (req, res, next) => {
  res.status(200).json({ users: DUMMY_USERS });
};

const signup = (req, res, next) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()){
    console.log(errors);
    throw new HttpError('Invalid inputs', 422)
  }

  const { name, email, password } = req.body;

  const hasUser = DUMMY_USERS.find(u => u.email === email);

  if (hasUser){
    throw new HttpError('Could noy create user. Email already in use', 422);
  }

  const createdUser = {
    id: uuidv4(),
    name, 
    email,
    password
  };
  DUMMY_USERS.push(createdUser);
  res.status(201).json({ createdUser });
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  const identifiedUser = DUMMY_USERS.find(u => u.email === email);
  if (!identifiedUser || identifiedUser.password !== password){
    throw new HttpError( 'Could not identify user', 401);
  }
  res.status(200).json({ message: 'User Logged In' , identifiedUser });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;