const express = require("express");
const router = express.Router();
const userControllers = require("../controllers/users.controller");

const imageUploader = require('../helpers/imageUploader')

router.post("/login", userControllers.login, (req, res, next) => {
  res.send(req.data);
},
(error, req, res, next) => {
  res.status(400).send({ error: error.message })
});

router.post("/register",imageUploader.upload.single('image_src'),userControllers.createUser, async (req, res, next) => {
  res.send(req.data);
},
(error, req, res, next) => {
  res.status(400).send({ message: error.message, status: 'failed',statusCode: "400" })
});

router.get("/users", userControllers.listUser, (req, res, next) => {
  res.send(req.data);
},
(error, req, res, next) => {
  res.status(400).send({ error: error.message })
});

router.put("/users/:id",imageUploader.upload.single('image_src'), userControllers.updateUser, (req, res, next) => {
  res.send(req.data);
},
(error, req, res, next) => {
  res.status(400).send({ error: error.message })
});

module.exports = router;
