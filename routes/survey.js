const express = require('express');
const router = express.Router();
const surveyControllers = require('../controllers/survey.controller');

router.post("/:uuid", surveyControllers.updateSurveyData, 
(req, res, next) => {
  res.send(req.data);
});

router.get("/data/:uuid", surveyControllers.getSurveyData, 
(req, res, next) => {
  res.send(req.data);
});


router.post("/create/surveydata", surveyControllers.createSurvey, 
(req, res, next) => {
  res.send(req.data);
});

module.exports = router;




