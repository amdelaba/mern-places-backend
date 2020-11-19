const HttpError = require('../models/http-error')

const DUMMY_PLACES = [
  {
    id: 'p1',
    title: 'ESB',
    description: 'blah blah',
    location: {
      lat: 40,
      lng: '-73'
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

const getPlaceByUserId = (req, res, next) => {
  const userId = req.params.uid;
  const place = DUMMY_PLACES.find(p => p.creator === userId);
  if (!place) {
    // Can use either throw or next but must use next() if working with synchrnous functions (ie DB)
    return next(new HttpError('Could not find a place for the provided UserId', 404));
  }
  res.json({ place });
};

exports.getPlaceById = getPlaceById;
exports.getPlaceByUserId = getPlaceByUserId;