const express = require("express");
const router = express.Router();
const userControllers = require("../controllers/users.controller");
const upload = require('../middleware/upload');
const Resize = require('../Resize');

router.post("/login", userControllers.login, (req, res, next) => {
  res.send(req.data);
});

router.post("/register", userControllers.createUser,  async (req, res, next) => {
  res.send(req.data);
});

router.get("/users", userControllers.listUser, (req, res, next) => {
  res.send(req.data);
});

router.put("/users/:id", userControllers.updateUser, (req, res, next) => {
  res.send(req.data);
});

module.exports = router;
