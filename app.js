const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const HttpError = require('./models/http-error');
const placesRoutes = require('./routes/places-routes');
const userRoutes = require('./routes/users-routes');

const app = express();

app.use(bodyParser.json());

app.use( '/api/places', placesRoutes);
app.use( '/api/users', userRoutes); 

app.use((req, res, next) => {
  throw new HttpError('Could not find this route', 404);
});


app.use((error, req, res, next ) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500).json({message: error.message || 'An Unknown Error Occurred'});
});

mongoose
  .connect('mongodb+srv://andres:K6AdCYHlmbtgvaHV@cluster0.l1plq.mongodb.net/places_db?retryWrites=true&w=majority')
  .then(() =>{
    app.listen(5000);
  })
  .catch(err => {
    console.log(err);
  });
