const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator')
 
const HttpError = require('../models/http-error');

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


const getPlaceById = (req, res, next) => {
  const placeId = req.params.pid;
  const place = DUMMY_PLACES.find(place => place.id === placeId);
  if (!place) {
    // Can use either throw or next but must use next() if working with synchrnous functions (ie DB)
    throw new HttpError('Could not find a place for the provided Id', 404)
  }
  res.json({ place });
};

const getPlacesByUserId = (req, res, next) => {
  const userId = req.params.uid;
  const places = DUMMY_PLACES.filter(p => p.creator === userId);
  if (!places || places.length === 0)  {
    // Can use either throw or next but must use next() if working with synchrnous functions (ie DB)
    return next(new HttpError('Could not find any places for the provided UserId', 404));
  }
  res.json({ places });
};

const createPlace =  (req, res, next) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()){
    console.log(errors);
    throw new HttpError('Invalid inputs', 422)
  }

  const { title, description, coordinates, address, creator } = req.body;
  const createdPlace = {
    id: uuidv4(),
    title, 
    description, 
    location: coordinates, 
    address, 
    creator
  }
  DUMMY_PLACES.push(createdPlace);
  res.status(201).json({ place: createdPlace })
};

const updatePlace =  (req, res, next) => {
  
  const errors = validationResult(req);
  if (!errors.isEmpty()){
    console.log(errors);
    throw new HttpError('Invalid inputs', 422)
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;
  const updatePlace = { ...DUMMY_PLACES.find(place => place.id === placeId) };
  if (!updatePlace) {
    throw new HttpError('Could not find a place for the provided Id', 404)
  }
  const placeIndex = DUMMY_PLACES.findIndex(place => place.id === placeId);

  updatePlace.title = title;
  updatePlace.description = description;

  DUMMY_PLACES[placeIndex] = updatePlace;
  res.status(200).json({ place: updatePlace })

};

const deletePlace =  (req, res, next) => {
  const placeId = req.params.pid;
  if (!DUMMY_PLACES.find(p => p.id === placeId)) {
    throw new HttpError('Could not find a place for the provided Id', 404)
  }
  DUMMY_PLACES = DUMMY_PLACES.filter(place => place.id !== placeId)
  res.status(200).json({ 
    message: 'place successfully deleted', 
    places: DUMMY_PLACES
  })
};


exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;