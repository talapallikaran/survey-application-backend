const express = require('express');
const router = express.Router();
const surveyControllers = require('../controllers/survey.controller');

router.post("/", surveyControllers.updateSurvey, 
(req, res, next) => {
  res.send(req.data);
});

router.get("/data", surveyControllers.getdata, 
(req, res, next) => {
  res.send(req.data);
});
module.exports = router;




