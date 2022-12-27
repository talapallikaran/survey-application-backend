const { pool } = require('../config');
require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const uuid = require('uuid');
const { v4: uuidv4 } = require('uuid');
const multer = require("multer");
const path = require("path");


let isActive = 1;
let deleteFlag = 0;
// let role_id = 3;
const date = new Date();

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, ".uploads"), // cb -> callback
//   filename: (req, file, cb) => {
//     const uniqueName = `${Date.now()}-${Math.round(
//       Math.random() * 1e9
//     )}${path.extname(file.originalname)}`;
//     cb(null, uniqueName);
//   },
// });

// const handleMultipartData = multer({
//   storage,
//   limits: { fileSize: 1000000 * 5 },
// }).single("image");




const getUsers = function() {
    return new Promise(function(resolve, reject) {
      pool.query('select u.*,r.name as reporting_person_name,s.name as role from users u left join users r on u.reporting_person_id=r.id left join roles s ON s.id = u.role_id ORDER by u.id asc', [])
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
          resolve(results.rows[0]);
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

async function isUserExistsId(id) {
  return new Promise(resolve => {
      pool.query('SELECT * FROM users WHERE id = $1', [id], (error, results) => {
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

async function getWorker(id) {
  return new Promise(resolve => {
      pool.query('select u.id,w.name as worker,w.uuid as wuuid from users u left join users w on w.reporting_person_id= u.id where u.id = $1 ORDER by u.id asc ', [id], (error, results) => {
          if (error) {
              throw error;
          }

          return resolve(results.rows);
      });
  });
}




async function create(data) {
const uid = uuidv4();
    return new Promise(function(resolve, reject) {
      validateUserDatawithPassword(data)
        .then(function() {
        
          return hashPassword(data.password);
        })
        .then(function(hash) {
          return pool.query('INSERT INTO users (name, email,phone,role_id,isactive,deleteflag,password,uuid,updateddate,reporting_person_id,image_src,last_name) VALUES ($1, $2, $3, $4, $5, $6, $7, $8,$9,$10,$11,$12)', [data.name, data.email, data.phone, data.role_id, isActive, deleteFlag, hash, uid, date,data.reporting_person_id,data.image_src,data.last_name]);
        })
        .then(function(result) {
          console.log("uuid----------------------------------",uid);
   
          resolve(result.rows[0]);
        })
        .catch(function(err) {
          reject(err);
        });
    });
  }

  async function updateUserPassword(data) {
    return new Promise(function(resolve, reject) {
      if (!data.id) {
        reject('error: id missing')
      }
      else{
        validateUserDatawithPassword(data)
        .then(function() {
          if(data.password)
          return hashPassword(data.password);
        })
        .then(function(hash) {
          return pool.query('UPDATE users SET name = $2,email = $3,phone = $4,role_id = $5,password = $6,reporting_person_id = $7,image_src = $8,last_name = $9 WHERE id = $1', [data.id, data.name, data.email, data.phone,data.role_id,hash,data.reporting_person_id,data.image_src,data.last_name]);
          
        })
        .then(function(result) {
          resolve(result.rows[0]);
        })
        .catch(function(err) {
          reject(err);
        });
      }
     
    });
  }
  async function updateUser(data) {
    return new Promise(function(resolve, reject) {
      if (!data.id) {
        reject('error: id missing')
      }
      else{
        validateUserData(data)
        .then(function(hash) {
          return pool.query('UPDATE users SET name = $2,email = $3,phone = $4,role_id = $5,reporting_person_id = $6,image_src = $7,last_name= $8 WHERE id = $1', [data.id, data.name, data.email, data.phone,data.role_id,data.reporting_person_id,data.image_src,data.last_name]);
          
        })
        .then(function(result) {
          resolve(result.rows[0]);
        })
        .catch(function(err) {
          reject(err);
        });
      }
     
    });
  }


  async function DeleteReviews(id) {
    return new Promise(function(resolve, reject) {
      if (!id) {
        reject('error: id missing')
      }
      else{
       
          pool.query('DELETE FROM reviews re USING  submissions sb  WHERE  re.submission_id = sb.id AND sb.user_id = $1', [id])
            .then(function(results) {
         
              resolve(results.rows);
          
            })
            .catch(function(err) {
              reject(err);
            });
      }

    });
  }


  async function DeleteSupervisaorReviews(id) {
    return new Promise(function(resolve, reject) {
      if (!id) {
        reject('error: id missing')
      }
      else{
       
          pool.query('DELETE FROM supervisor_reviews bp USING supervisor_submissions sl WHERE bp.sv_submission_id = sl.id AND sl.worker_id = $1', [id])
            .then(function(results) {
         
              resolve(results.rows);
          
            })
            .catch(function(err) {
              reject(err);
            });
      }

    });
  }


  
  async function DeleteSupervisaorReviewsSupervisor(id) {
    return new Promise(function(resolve, reject) {
      if (!id) {
        reject('error: id missing')
      }
      else{
       
          pool.query('DELETE FROM supervisor_reviews bp USING supervisor_submissions sl WHERE bp.sv_submission_id = sl.id AND sl.user_id = $1', [id])
            .then(function(results) {
         
              resolve(results.rows);
          
            })
            .catch(function(err) {
              reject(err);
            });
      }

    });
  }

  async function DeleteSubmission(id) {
    return new Promise(function(resolve, reject) {
      if (!id) {
        reject('error: id missing')
      }
      else{
       
          pool.query('delete from submissions where user_id = $1', [id])
            .then(function(results) {
         
              resolve(results.rows);
          
            })
            .catch(function(err) {
              reject(err);
            });
      }

    });
  }

  async function DeleteSupervisaorSubmission(id) {
    return new Promise(function(resolve, reject) {
      if (!id) {
        reject('error: id missing')
      }
      else{
       
          pool.query('delete from supervisor_submissions where worker_id = $1', [id])
            .then(function(results) {
         
              resolve(results.rows);
          
            })
            .catch(function(err) {
              reject(err);
            });
      }

    });
  }


  async function DeleteSupervisaorSubmissionSuperviosr(id) {
    return new Promise(function(resolve, reject) {
      if (!id) {
        reject('error: id missing')
      }
      else{
       
          pool.query('delete from supervisor_submissions where user_id = $1', [id])
            .then(function(results) {
         
              resolve(results.rows);
          
            })
            .catch(function(err) {
              reject(err);
            });
      }

    });
  }


  async function DeleteUser(id) {
    return new Promise(function(resolve, reject) {
      if (!id) {
        reject('error: id missing')
      }
      else{
       
          pool.query('delete from users where id = $1', [id])
            .then(function(results) {
         
              resolve(results.rows);
          
            })
            .catch(function(err) {
              reject(err);
            });
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
      if (!data.email || !data.phone) {
        reject('email and Phone missing')
      }
      else {
    
        validateEmail(data.email)
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
  function validateUserDatawithPassword(data) {
    return new Promise(function(resolve, reject) {
      if (!data.password || !data.email || !data.phone) {
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
    updateUser,
    updateUserPassword,
    getWorker,
    DeleteReviews,
    DeleteUser,
    DeleteSupervisaorReviews,
    DeleteSubmission,
    DeleteSupervisaorSubmission,
    isUserExistsId,
    DeleteSupervisaorSubmissionSuperviosr,
    DeleteSupervisaorReviewsSupervisor
}