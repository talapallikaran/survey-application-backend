require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const uuid = require("uuid");
var User = require("./../models/user");
const uid = uuid.v4();
const multer = require("multer");
var Survey = require('./../models/survey');

const listUser = function (req, res) {
  User.getUsers()
    .then(function (result) {
      return res.status(200).json(result);
    })
    .catch(function (err) {
      return res.status(400).json({
        message: err,
        statusCode: "400",
      });
    });
};

const createUser = (req, res, err) => {
  if (!req.file) {
    return res.status(400).send({
      message: "No file received or invalid file type",
      success: false,
    });
  } else {
    User.isUserExists(req.body.email).then((isExists) => {
      if (isExists) {
        return res.status(400).json({
          status: "failed",
          message: "Email is taken.",
          statusCode: "400",
        });
      } else {
        let image_src = req.file ? req.file.path : null;
        console.log("image", image_src);
        let {
          name,
          email,
          phone,
          role_id,
          password,
          confirmPassword,
          reporting_person_id,
          last_name,
        } = req.body;

        User.create({
          name,
          email,
          phone,
          role_id,
          password,
          confirmPassword,
          reporting_person_id,
          image_src,
          last_name,
        })
          .then(function (result) {
            console.log("result", result);
            return res.status(200).json({
              status: "success",
              statusCode: "200",
              message: "success! created account for new user",
            });
          })
          .catch(function (err) {
            return res.status(400).json({
              message: err,
              statusCode: "400",
            });
          });
      }
    });
  }
};

const login = (request, response) => {
  const { email, password } = request.body;
  let name;
  let worker_uuid;
  let getworker = [];
  let workerdata = [];
  User.isUserExists(email).then(
    (isExists) => {
      if (!isExists) {
        return response.status(401).json({
          status: "failed",
          message: "Invalid email or password!",
          statusCode: "401",
        });
      }
      User.getUser(email, uuid).then((user) => {
        bcrypt.compare(password, user.password, (error, isValid) => {
          if (error) {
            throw error;
          }
          if (!isValid) {
            return response.status(401).json({
              status: "failed",
              message: "Invalid email or password??!",
              accessToken: null,
              statusCode: "401",
            });
          } else {
            console.log("user", user);
            //signing token with user id
            const token = jwt.sign(
              {
                id: user.id,
              },
              process.env.API_SECRET,
              {
                expiresIn: 86400,
              }
            );
            if (user.role_id === 2) {
              User.getWorker(user.id).then(function (result) {
                workerdata = result;
                workerdata.map((data) => {
                  name = data.worker;
                  worker_uuid = data.wuuid;
                  getworker.push({
                    id: worker_uuid,
                    name: name,
                  });
                });
                response.status(200).json({
                  status: "success",
                  statusCode: "200",
                  message: "Login Successfully!",
                  accessToken: token,
                  email: email,
                  uuid: user.uuid,
                  name: user.name,
                  profile: user.image_src,
                  role_id: user.role_id,
                  worker_data: getworker,
                });
              });
            } else {
              console.log("worker");
              response.status(200).json({
                status: "success",
                statusCode: "200",
                message: "Login Successfully!",
                accessToken: token,
                email: email,
                uuid: user.uuid,
                name: user.name,
                profile: user.image_src,
                role_id: user.role_id,
              });
            }
          }
        });
      });
    },
    (error) => {
      response.status(400).json({
        status: "failed",
        statusCode: "400",
        message: "Error while login.",
      });
    }
  );
};

const updateUser = (req, res) => {
  let image_src = req.file ? req.file.path : req.body.image_src;
  console.log("image", image_src);
  const { id } = req.params;
  const { password } = req.body;
  User.isUserExists(req.body.email).then((isExists) => {
    console.log("isexistes", isExists);
  });
  User.getUserId(id).then((user) => {
    if (password === user.password) {
      User.updateUser({
        id: req.params.id,
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        role_id: req.body.role_id,
        reporting_person_id: req.body.reporting_person_id,
        image_src: image_src,
        last_name: req.body.last_name,
      })
        .then(function (result) {
          return res.status(200).json({
            status: "success",
            statusCode: "200",
            message: "success! user data updated suucessfully",
          });
        })
        .catch(function (err) {
          return res.status(400).json({
            message: err,
          });
        });
    } else {
      User.updateUserPassword({
        id: req.params.id,
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        role_id: req.body.role_id,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        reporting_person_id: req.body.reporting_person_id,
        image_src: image_src,
        last_name: req.body.last_name,
      })
        .then(function (result) {
          console.log("result", result);
          return res.status(200).json({
            status: "success",
            statusCode: "200",
            message: "success! user data updated suucessfully",
          });
        })
        .catch(function (err) {
          return res.status(400).json({
            message: err,
          });
        });
    }
  });
};

const deleteUser = (request, response, error) => {
  const { id } = request.params;
  User.isUserExistsId(id).then((isExists) => {

    if (!isExists) {
      return response.status(401).json({
        status: "failed",
        message: "User not found",
        statusCode: "401",
      });
    } else {
      User.getUserId(id).then((user) => {
        if (user.role_id === 2) {
          Survey.checkSubmissionExistsForDelete(user.id).then(async function (result) {
            
            if (result) {
              User.DeleteReviews(user.id).then(function (result) {
                if (result.length == 0) {
                  User.DeleteSubmission(user.id).then(function (result) {
    
                    if (result.length === 0) {
                      User.DeleteUser(user.id).then(function (result) {
                        return response.status(200).json({
                          status: "success",
                          statusCode: "200",
                          message: "success! user data deleted suucessfully",
                        });
                      });
                    } else {
                      return response.status(400).json({
                        status: "error",
                        statusCode: "400",
                        message: error,
                      });
                    }
                  });
                }
            })
            }
            else{
         
                User.DeleteSupervisaorReviewsSupervisor(user.id).then(function (result) {
                
                  if (result.length === 0) {
                    User.DeleteSupervisaorSubmissionSuperviosr(user.id).then(function (result) {
                    
                      if (result.length === 0) {
                        User.DeleteUser(user.id).then(function (result) {
                          console.log("resultUser",result);
                          return response.status(200).json({
                            status: "success",
                            statusCode: "200",
                            message: "success! user data deleted suucessfully",
                          });
                        });
                      } else {
                        return response.status(400).json({
                          status: "error",
                          statusCode: "400",
                          message: error,
                        });
                      }
                    });
                  }
                });
            }
        })
        } else {
          Survey.checkSubmissionExistsForDelete(user.id).then(async function (result) {
            if (result) {
              User.DeleteReviews(user.id).then(function (result) {
                if (result.length == 0) {
                  User.DeleteSubmission(user.id).then(function (result) {
                    if (result.length === 0) {
                      User.DeleteUser(user.id).then(function (result) {
                        return response.status(200).json({
                          status: "success",
                          statusCode: "200",
                          message: "success! user data deleted suucessfully",
                        });
                      });
                    } else {
                      return response.status(400).json({
                        status: "error",
                        statusCode: "400",
                        message: error,
                      });
                    }
                  });
                }
              });
            }
            else {
              User.DeleteSupervisaorReviews(user.id).then(function (result) {
                if (result.length === 0) {
                  User.DeleteSupervisaorSubmission(user.id).then(function (result) {
                    if (result.length === 0) {
                      User.DeleteUser(user.id).then(function (result) {
                        return response.status(200).json({
                          status: "success",
                          statusCode: "200",
                          message: "success! user data deleted suucessfully",
                        });
                      });
                    } else {
                      return response.status(400).json({
                        status: "error",
                        statusCode: "400",
                        message: error,
                      });
                    }
                  });
                }
              });
            }
          })

        }
      });
    }
  });
};

module.exports = {
  login,
  createUser,
  listUser,
  updateUser,
  deleteUser,
};
