const express = require('express');
const router = express.Router();
const imageController = require('../controllers/image.controller')
const imageUploader = require('../helpers/imageUploader')

router.post("/upload", imageUploader.upload.single('image'),imageController.upload, 
(req, res, next) => {
  res.send(req.data);
});



module.exports = router;




