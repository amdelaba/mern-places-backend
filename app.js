const express = require('express');
const bodyParser = require('body-parser');

const placesRoutes = require('./routes/places-routes');
const userRoutes = require('./routes/users-routes');

const app = express();

// Registers the middleware
app.use( '/api/places', placesRoutes); // => /api/places/...
// app.use( '/api/user', userRoutes); // => /api/user/...

app.use((error, req, res, next ) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500).json({message: error.message || 'An Unknown Error Occurred'});
});



app.listen(5000);