const express = require('express');
const router = express.Router();
const surveyControllers = require('../controllers/survey.controller');

router.post("/submission", surveyControllers.updateSurveyData, 
(req, res, next) => {
  res.send(req.data);
});

router.get("/data", surveyControllers.getSurveyData, 
(req, res, next) => {
  res.send(req.data);
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




