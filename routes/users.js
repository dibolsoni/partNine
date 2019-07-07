const express = require('express');
const router = express.Router();
const atob = require('atob');

// const Op = Sequelize.Op;
const Course = require('../models').Course;
const User = require('../models').User;

const _users = [{username: 'a'}]

//app modules
const { check, validationResult } = require('express-validator');
const bcryptjs = require('bcryptjs');
const auth = require('basic-auth');




const getCredentials = (req) => {
  let credentials = null;

  const authorizationHeaderValue = req.get('Authorization');

  if (authorizationHeaderValue && authorizationHeaderValue.startsWith('Basic ')) {
    const base64Credentials = authorizationHeaderValue.slice(6);
    const stringCredentials = atob(base64Credentials);
    const partsCredentials = stringCredentials.split(':');

    credentials = {
      name: partsCredentials[0],
      pass: partsCredentials[1],
    };
  }

  return credentials;
};

/**
 * Middleware to authenticate the request using Basic Authentication.
 * @param {Request} req - The Express Request object.
 * @param {Response} res - The Express Response object.
 * @param {Function} next - The function to call to pass execution to the next middleware.
 */
const authenticateUser = (req, res, next) => {
    // router.currentUser = null;
    let message = null;
    console.log('Authenticating user...');
    // Get the user's credentials from the Authorization header.
    const credentials = getCredentials(req);

  
    if (credentials) {
      // Look for a user whose `username` matches the credentials `name` property.
      User.findOne({
        where: {
          emailAddress: credentials.name
        } 
      })
        .then(user => {
          if (user) {
            user.fullname = `${user.firstName} ${user.lastName}`;
            const authenticated = bcryptjs
              .compareSync(credentials.pass, user.password);
            if (authenticated) {
              // Store the user on the Request object.
              req.currentUser = user;
              console.log('req', req.currentUser)
              console.log(`Authentication successful for username: ${user.fullname}`);
              next();

            } else {
              message = `Authentication failure for username: ${user.name}`;
            }
          } else {
            message = `User not found for username: ${credentials.name}`;
          }
        })

    } else {
      message = 'Auth header not found';
    }
    console.log('Authenticating: finished');
  
    if (message) {
      console.warn(message);
      res.status(401).json({ message: 'Access Denied' });
    } else {
      next();
    }
};



// Route that returns the current authenticated user.
router.get('/', authenticateUser, (req, res) => {
  const user = req.currentUser;
  console.log("user", user);
  res.json({
    name: user.firstName,
    username: user.emailAddress,
  });
});


router.post('/new', (req, res, next) => {
  const user = req.body
  // hash the password if provided
  if (user.password) {
    user.password = bcryptjs.hashSync(user.password);
  }
  
  User.create(user).then((u) => {
    console.log('user', u)
    res.location('/');
    res.status(201).end()
    
  }).catch((err) => {
    console.log(err)
    err.status = 400;
    return next(err);
  })   
})


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
      console.log(user.password)
      user.password = bcryptjs.hashSync(user.password);
      console.log(user.password)
    }

    // Get the user from the request body.
    User.create(user)
        .then(() => {
          res.location('/');
          res.status(201).end()
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