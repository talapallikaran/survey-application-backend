const { pool } = require('../config');
require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const uuid = require("uuid");
const uid = uuid.v4();
const multer = require("multer");
const path = require("path");

let isActive = 1;
let deleteFlag = 0;
let role_id = 3;
const date = new Date();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, ".uploads"), // cb -> callback
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const handleMultipartData = multer({
  storage,
  limits: { fileSize: 1000000 * 5 },
}).single("image");




const getUsers = function() {
    return new Promise(function(resolve, reject) {
      pool.query('select u.*,r.name as reporting_person_name from users u left join users r on u.reporting_person_id=r.id ORDER by u.id asc', [])
        .then(function(results) {
          resolve(results.rows);
        })
        .catch(function(err) {
          reject(err);
        });
    });
  }

  const getUserId = function(id) {
    return new Promise(function(resolve, reject) {
      pool.query('SELECT * FROM users where id = $1', [id])
        .then(function(results) {
          resolve(results.rows);
        })
        .catch(function(err) {
          reject(err);
        });
    });
  }

async function isUserExists(email) {
    return new Promise(resolve => {
        pool.query('SELECT * FROM users WHERE email = $1', [email], (error, results) => {
            if (error) {
                throw error;
            }

            return resolve(results.rowCount > 0);
        });
    });
}

async function getUser(email, uuid) {
    return new Promise(resolve => {
        pool.query('SELECT * FROM users WHERE email = $1 or uuid = $2', [email, uuid], (error, results) => {
            if (error) {
                throw error;
            }

            return resolve(results.rows[0]);
        });
    });
}


async function create(data) {
    return new Promise(function(resolve, reject) {
      validateUserData(data)
        .then(function() {
          return hashPassword(data.password);
        })
        .then(function(hash) {
          return pool.query('INSERT INTO users (name, email,phone,role_id,isactive,deleteflag,password,uuid,updateddate,reporting_person_id,image_src) VALUES ($1, $2, $3, $4, $5, $6, $7, $8,$9,$10,$11)', [data.name, data.email, data.phone, role_id, isActive, deleteFlag, hash, uid, date,data.reporting_person_id,image_src]);
        })
        .then(function(result) {
          resolve(result.rows[0]);
        })
        .catch(function(err) {
          reject(err);
        });
    });
  }

  function updateUser(data) {
    return new Promise(function(resolve, reject) {
      if (!data.id) {
        reject('error: id missing')
      }
      else {
        validateUserData(data)
        .then(function() {
          return pool.query('UPDATE users SET name = $2,email = $3,phone = $4,password = $5,reporting_person_id = $6 WHERE id = $1 returning name', [data.id, data.name, data.email, data.phone,data.password,data.reporting_person_id]);
        }
          .then(function(result) {
            resolve(result.rows[0]);
          })
          .catch(function(err) {
            reject(err);
          })
          );
      }
    });
  }

function hashPassword(password) {
    return new Promise(function(resolve, reject) {
      bcrypt.genSalt(10, function(err, salt) {
        if (err) {
          reject(err);
        }
        else {
          bcrypt.hash(password, salt, function(err, hash) {
            if (err) {
              reject(err);
            }
            else {
              resolve(hash);
            }
          });
        }
      });
    });
  }
  
  function validateUserData(data) {
    return new Promise(function(resolve, reject) {
      if (!data.password || !data.email || !data.phone) {
        console.log("data",data.password, data.email ,data.phone);
        reject('email and/or password, Phone missing')
      }
      else {
    
        validatePassword(data.password, 6, data.confirmPassword)
          .then(function() {
            return validateEmail(data.email);
          })
          .then(function(){
            return validatePhone(data.phone);
          })
          .then(function() {
            resolve();
          })
          .catch(function(err) {
            reject(err);
          });
      }
    });
  }
  
  function validateEmail(email) {
    return new Promise(function(resolve, reject) {
      if (typeof (email) !== 'string') {
        reject('email must be a string');
      }
      else {
        var re = new RegExp(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/);
        if (re.test(email)) {
          resolve();
        }
        else {
          reject('provided email does not match proper email format');
        }
      }
    });
  }
  
  function validatePassword(password, minCharacters,confirmPassword) {
    return new Promise(function(resolve, reject) {
      if (typeof (password) !== 'string') {
        reject('password must be a string');
      }
      else if (password.length < minCharacters) {
        reject('password must be at least ' + minCharacters + ' characters long');
      }
      else if (password !== confirmPassword) {
        reject("Confirm Password does not match with password");
      }
      else {
        resolve();
      }
    });
  }


  function validatePhone(phone) {
    return new Promise(function(resolve, reject) {

        re = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
        if (re.test(phone)) {
          resolve();
        }
        else {
          reject('Phone number not match proper format');
        }
    });
  }

  async function findOneById(uuid) {
    return new Promise(resolve => {
        pool.query('SELECT * FROM users WHERE uuid = $1', [uuid], (error, results) => {
            if (error) {
                throw error;
            }

            return resolve(results.rows[0]);
        });
    });
}


module.exports = {
    isUserExists,
    getUser,
    create,
    getUsers,
    findOneById,
    getUserId,
    handleMultipartData,
    updateUser
}