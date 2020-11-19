const axios = require('axios');

const HttpError = require('../models/http-error')

const API_KEY ='AIzaSyArBHoucqNVOGYblhYqe4sDSWwiXqKlJg4';

// See: https://developers.google.com/maps/documentation/geocoding/start#geocoding-request-and-response-latitudelongitude-lookup
// for API documentation

async function getCoordsForAddress(address) {
  const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(
    address
  )}&inputtype=textquery&fields=geometry&key=${API_KEY}`;
 
  const response = await axios.get(url);
 
  const data = response.data;
  if (!data || data.status === "ZERO_RESULTS") {
    const error = new HttpError(
      "Could not find location for the specified address.",
      422
    );
    throw error;
  }
  const coordinates = data.candidates[0].geometry.location;
 
  return coordinates;
}

module.exports = getCoordsForAddress;