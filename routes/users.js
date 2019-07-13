'use strict';

const express = require('express');
const router = express.Router();

const { check, validationResult } = require('express-validator');
const authenticateUser = require('./authenticator')
const bcryptjs = require('bcryptjs');


// const Op = Sequelize.Op;
const Course = require('../models').Course;
const User = require('../models').User;




// Route that returns the current authenticated user.
router.get('/', authenticateUser, (req, res, next) => {
  const user = req.body.currentUser;
  res.json({
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    username: user.emailAddress
  })
  res.end();
});

// Route that creates a new user.
router.post('/',
    [
        check('firstName')
        .exists({ checkNull: true, checkFalsy: true })
        .withMessage('Please provide a value for "first name"'),
        check('lastName')
        .exists({ checkNull: true, checkFalsy: true })
        .withMessage('Please provide a value for "last name"'),
        check('emailAddress')
        .exists({ checkNull: true, checkFalsy: true })
        .withMessage('Please provide a value for "emailAddress"'),
        check('password')
        .exists({ checkNull: true, checkFalsy: true })
        .withMessage('Please provide a value for "password"'),
    ], 
    (req, res, next) => {

    // Attempt to get the validation result from the Request object.
    const errors = validationResult(req);

    // If there are validation errors...
    if (!errors.isEmpty()) {
        // Use the Array `map()` method to get a list of error messages.
        const errorMessages = errors.array().map(error => error.msg);

        // Return the validation errors to the client.
        return res.status(400).json({ errors: errorMessages });
    }

    const user = req.body
    // hash the password if provided
    if (user.password) {
      user.password = bcryptjs.hashSync(user.password);
    }

    // Creates user
    User.create(user)
        .then(() => {
          res.status(201).location('/').end()
        }).catch(function(err){
          if (err.name === 'SequelizeUniqueConstraintError') {
            err.status = 400;
            err.message = 'Email already exists'
            return next(err);
          } else {
            err.status = 400;
            return next(err);
          };
        });
});

module.exports = router;