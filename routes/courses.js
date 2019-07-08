const express = require('express');
const router = express.Router();

const { check, validationResult } = require('express-validator');

const authenticateUser = require('./authenticator');

const Course = require('../models').Course;
const User = require('../models').User;

router.get('/',  authenticateUser, (req, res, next) => {
    Course.findAll({include: [{model:User}], order: [["title", "ASC"]]})
    .then(function(courses){
        res.status(200).json({courses: courses, body: JSON.stringify(req.body)})
      }).catch(function(err){
          err.status = 500;
          next(err);
      });
})

router.get('/:id',  authenticateUser, (req, res, next) => {
  const course_id = req.params.id;
  Course.findOne({where: [{id: course_id }], include: [{model:User}], order: [["title", "ASC"]]}).then(function(courses){
    res.status(200).json({courses: courses, body: JSON.stringify(req.body)})
  }).catch(function(err){
      err.status = 500;
      next(err);
   });
})

router.post('/',
    [
        check('title')
        .exists({ checkNull: true, checkFalsy: true })
        .withMessage('Please provide a value for "title"'),
        check('description')
        .exists({ checkNull: true, checkFalsy: true })
        .withMessage('Please provide a value for "description"'),
        check('estimatedTime')
        .exists({ checkNull: false, checkFalsy: true })
        .withMessage('Please provide a value for "estimated time"'),
        check('materialsNeeded')
        .exists({ checkNull: false, checkFalsy: true })
        .withMessage('Please provide a value for "materials needed"'),
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

    const course = req.body

    // Get the course from the request body.
    Course.create(course)
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

router.put('/:id',  authenticateUser, 
  [
    check('title')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a value for "title"'),
    check('description')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a value for "description"'),
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
    const course_id = req.params.id;
    const course_updated = req.body;
    Course.findOne({where: [{id: course_id }], include: [{model:User}], order: [["title", "ASC"]]})
      .then((course) => {
        if (course) {
          course.update(course_updated);
          res.status(201).end();
        } else {
          const err = new Error('course not found')
          err.status = 404;
          next(err);
        }
      })
      .catch(err => {
        err.status = 400;
        next(err)
      })
});

router.delete('/:id',  authenticateUser, (req, res, next) => {
  const course_id = req.params.id;
  Course.findByPk(course_id)
    .then(course => {
      if (course) {
        course.destroy();
        res.status(201).end();
      } else {
        const err = new Error('course not found')
        err.status = 404;
        next(err);
      }

  }).catch(function(err){
      err.status = 500;
      next(err);
   });
})

module.exports = router;