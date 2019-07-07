const express = require('express');
const router = express.Router();

const Course = require('../models').Course;
const User = require('../models').User;

router.get('/', (req, res) => {
    Course.findAll({include: [{model:User}], order: [["title", "ASC"]]}).then(function(courses){
      res.status(200).json(courses)
    }).catch(function(error){
        res.status(500).send(error);
     });
  })

  module.exports = router;