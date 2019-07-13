const express = require('express');
const router = express.Router();

const { check, validationResult } = require('express-validator');

const authenticateUser = require('./authenticator');

const Course = require('../models').Course;
const User = require('../models').User;

router.get('/', (req, res, next) => {
    const user = req.body.currentUser;
    
    Course.findAll({
      attributes:{ exclude: ['createdAt', 'updatedAt'] },
      include: [{
        model:User,
        attributes: {exclude: ['password', 'createdAt', 'updatedAt']}
      }],
      order: [["title", "ASC"]]
    })
    .then(function(courses){
        res.status(200).json({courses: courses, user: user})
      }).catch(function(err){
          err.status = 500;
          next(err);
      });
})

router.get('/:id',  (req, res, next) => {
  const course_id = req.params.id;
  Course.findOne({
    attributes:{ exclude: ['createdAt', 'updatedAt'] },
      include: [{
        model:User,
        attributes: {exclude: ['password', 'createdAt', 'updatedAt']}
    }],
    where: [{id: course_id }]
  })
    .then(function(courses){
      res.status(200).json({courses: courses, user: req.body.currentUser})
    }).catch(function(err){
        err.status = 500;
        next(err);
    });
})

router.post('/', authenticateUser,
    [
        check('title')
        .exists({ checkNull: true, checkFalsy: true })
        .withMessage('Please provide a value for "title"'),
        check('description')
        .exists({ checkNull: true, checkFalsy: true })
        .withMessage('Please provide a value for "description"'),
        check('estimatedTime')
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
        .then((new_course) => {
          res.status(201).location(`/api/courses/${new_course.id}`).end()
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
    const user = req.body.currentUser;
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
    Course.findOne({where: [{id: course_id }], include: [{model:User}]})
      .then((course) => {
        if (course) {
          if (course.userId === user.id) {
            course.update(course_updated);
            res.status(204).end();
          } else {
            const err = new Error(`you must be the owner of the course to edit it`)
            err.status = 403;
            next(err);          
          }
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
  const user = req.body.currentUser;
  Course.findByPk(course_id)
    .then(course => {
      if (course) {
        if (course.userId === user.id) {
          course.destroy();
          res.status(204).end();
        } else {
          const err = new Error(`you must be the owner of the course delete it`)
          err.status = 403;
          next(err);          
        }
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