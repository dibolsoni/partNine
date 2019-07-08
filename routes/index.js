'use strict';
//main modules
const express = require('express');

//routes
const courses = require('./courses');
const users = require('./users');

// // This array is used to keep track of user records
// // as they are created.
// const users = [];


// Construct a router instance.
const router = express.Router();


router.use('/courses', courses);
router.use('/users', users);


// setup a friendly greeting for the root route
router.get('/', (req, res) => {
    res.json({
      message: 'Welcome to the REST API project!',
    });
  });

 


module.exports = router;