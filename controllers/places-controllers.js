const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../util/location')
const Place = require('../models/place');

let DUMMY_PLACES = [
  {
    id: 'p1',
    title: 'ESB',
    description: 'blah blah',
    location: {
      lat: 40,
      lng: -73
    },
    address: 'ESB address',
    creator: 'u1'
  }
]


const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;

  try {
    place = await Place.findById(placeId);
  } catch (err) {
    return next (new HttpError('Could not retrieve place from db', 500));
  }

  if (!place) {
    return next (new HttpError('Could not find a place for the provided Id', 404));
  }
  res.json({ place: place.toObject( { getters: true}) });
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  let places;
  try {
    places = await Place.find({ creator: userId });
  } catch (err) {
    return next (new HttpError('Could not retrieve places from db', 500));
  }

  if (!places || places.length === 0)  {
    return next(new HttpError('Could not find any places for the provided UserId', 404));
  }
  res.json({ places: places.map(p => p.toObject({ getters: true }) ) });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()){
    console.log(errors);
    return next(new HttpError('Invalid inputs', 422));
  }

  const { title, description, address, creator } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch(error) {
    return next(error);
  }

  const createdPlace = new Place({
    title, 
    description, 
    location: coordinates, 
    address, 
    creator,
    image: 'https://upload.wikimedia.org/wikipedia/commons/1/10/Empire_State_Building_%28aerial_view%29.jpg'
  })
  
  try {
    await createdPlace.save();
    res.status(201).json({ place: createdPlace })
  } catch(err){
    return next(new HttpError('Creating new place failed', 500))
  }

};

const updatePlace = async (req, res, next) => {
  
  const errors = validationResult(req);
  if (!errors.isEmpty()){
    console.log(errors);
    return next (new HttpError('Invalid inputs', 422));
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    return next (new HttpError('Could not retrieve place from db', 500));
  }
  
  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (err) {
    return next (new HttpError('Could not update place in db', 500));
  }

  res.status(200).json({ place: place.toObject({ getters: true }) })
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    return next (new HttpError('Something went wrong trying to find place', 500));
  }

  try {
    await place.remove();
  } catch (err) {
    return next (new HttpError('Something went wrong trying to delete place', 500));
  }
  
  res.status(200).json({ 
    message: 'place successfully deleted'
  })
};


exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;