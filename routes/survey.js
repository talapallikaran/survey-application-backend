const express = require('express');
const router = express.Router({ mergeParams: true });
const surveyControllers = require('../controllers/survey.controller');
var User = require('./../models/user');

router.post("/submission", surveyControllers.updateSurveyData, 
(req, res, next) => {
  res.send(req.data);
});

router.get("/data/:uuid", surveyControllers.getSurveyData, 
(req, res, next) => {

  res.send(req.data);
  next();
});


router.post("/create/surveydata", surveyControllers.createSurvey, 
(req, res, next) => {
  res.send(req.data);
});


router.post("/create/questiondata", surveyControllers.createQuestion, 
(req, res, next) => {
  res.send(req.data);
});

module.exports = router;




