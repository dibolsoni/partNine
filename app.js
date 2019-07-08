'use strict';

// load default modules
const express = require('express');

const morgan = require('morgan');
let bodyParser = require('body-parser');

// db
const db = require("./models");

//routes
const routes = require('./routes/');


// variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

// create the Express app
const app = express();

// setup morgan which gives us http request logging
app.use(morgan('dev'));
// Setup request body JSON parsing.
app.use(express.json());

//parsers
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


// Add routes.
app.use('/api', routes);


db.sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
});

// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found',
  });
});


// setup a global error handler
app.use((err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }

  res.status(err.status || 500).json({
    "code": err.status,
    message: err.message
  });
});


// set our port
app.set('port', process.env.PORT || 5000);

// start listening on our port
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});

