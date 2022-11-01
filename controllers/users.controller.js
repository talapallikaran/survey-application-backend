require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const uuid = require("uuid");
var User = require('./../models/user');
const uid = uuid.v4();


const listUser = function(req, res) {
    User.getUsers()
      .then(function(result) {
        return res.status(200).json(result);
      })
      .catch(function(err) {
        return res.status(400).json({
          message: err,
          statusCode: "400"
        });
      });
  }

const createUser =  (req, res) => {


    User.isUserExists(req.body.email).then(isExists => {
        if (isExists) {
            return res.status(400).json({
                status: 'failed',
                message: 'Email is taken.',
                statusCode: "400"
            });
        }
    else {
        User.create(req.body)
        .then(function(result) {
          return res.status(200).json({
            status: 'success',
            statusCode: "200",
            message: 'success! created account for new user'
          });
    })
        .catch(function(err) {
          return res.status(400).json({
            message: err,
            statusCode: "400"
          });
        });
    }
 
    });

  }

const login = (request, response) => {
    const { email, password } = request.body;
    User.isUserExists(email).then(isExists => {
        if (!isExists) {
            return response.status(401).json({
                status: 'failed',
                message: 'Invalid email or password!',
                statusCode: "401"
            });
        }
        User.getUser(email, uuid).then(user => {
            bcrypt.compare(password, user.password, (error, isValid) => {
                if (error) {
                    throw error;
                }
                if (!isValid) {
                    return response.status(401).json({
                        status: 'failed',
                        message: 'Invalid email or password??!',
                        accessToken: null,
                        statusCode: "401"
                    });
                }
                //signing token with user id
                const token = jwt.sign({
                    id: user.id
                }, process.env.API_SECRET, {
                    expiresIn: 86400
                });
                response.status(200).json({
                    status: 'success',
                    statusCode: "200",
                    message: 'Login Successfully!',
                    accessToken: token,
                    email: email,
                    uuid: user.uuid,
                    name:user.name
                });
            });
        });
    }, error => {
        response.status(400).json({
            status: 'failed',
            statusCode: "400",
            message: 'Error while login.'
        });
    });
};

const updateUser = (req, res) => {
    User.updateUser({ id: req.params.id, data: req.body })
      .then(function(result) {
        return res.status(200).json(result);
      })
      .catch(function(err) {
        return res.status(400).json({
          message: err
        });
      });
  }

module.exports = {
    login,
    createUser,
    listUser,
    updateUser
}