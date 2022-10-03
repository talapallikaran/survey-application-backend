const express = require("express");
const router = express.Router();
const userControllers = require("../controllers/users.controller");

router.post("/login", userControllers.login, (req, res, next) => {
  res.send(req.data);
});

router.post("/register", userControllers.createUser, (req, res, next) => {
  res.send(req.data);
});

router.get("/users", userControllers.listUser, (req, res, next) => {
  res.send(req.data);
});

module.exports = router;
