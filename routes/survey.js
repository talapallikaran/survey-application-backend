const express = require('express');
const router = express.Router();
const surveyControllers = require('../controllers/survey.controller');

router.post("/", surveyControllers.updateSurveyData, 
(req, res, next) => {
  res.send(req.data);
});

router.get("/data", surveyControllers.getSurveyData, 
(req, res, next) => {
  res.send(req.data);
});
module.exports = router;




