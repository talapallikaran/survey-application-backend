const { pool } = require('../config');
const date = new Date();
const month = date.getUTCMonth() + 1; 
const year = date.getUTCFullYear();

let accesslevel = 0;
let isActive = 1;
let deleteFlag = 0;




async function getSubmission(data) {
    return new Promise(resolve => {
        pool.query('SELECT users.id,submissions.user_id,submissions.comment,submissions.survey_id FROM submissions LEFT JOIN users ON users.id = submissions.user_id WHERE users.uuid = $1 AND submissions.survey_id = $2',[data.uuid,data.survey_id], (error, results) => {
            if (error) {
                throw error;
            }
            return resolve(results.rows);
        });
    });
}

async function getQuestionAnswer(data) {
  return new Promise(resolve => {
      pool.query('select r.qid,q.question,r.ans from questions q LEFT JOIN surveyquestions sq on sq.qu_id = q.id LEFT JOIN reviews r on r.qid = q.id LEFT JOIN submissions su on su.id= r.submission_id where su.user_id = $1 AND sq.survey_id = $2',[data.user_id,data.survey_id],(error, results) => {
          if (error) {
              throw error;
          }
          return resolve(results.rows);
      });
  });
}

async function getSurvey(data) {
  return new Promise(resolve => {
      pool.query('select * from survey where month = $1 AND year = $2',[month,year],(error, results) => {
          if (error) {
              throw error;
          }
          return resolve(results.rows);
      });
  });
}

async function getSubmissionId(id) {
  return new Promise(resolve => {
      pool.query('SELECT MAX(ID) FROM submissions',[],(error, results) => {
          if (error) {
              throw error;
          }
        console.log("results",results.rows);
          return resolve(results.rows);
        
      });
  });
}

async function getQuestion(data) {
  return new Promise(resolve => {
      pool.query('select q.id as qid,q.question from questions q LEFT JOIN surveyquestions sq on sq.qu_id = q.id where sq.survey_id = $1',[data.survey_id],(error, results) => {
          if (error) {
              throw error;
          }
          return resolve(results.rows);
      });
  });
}

async function getSubinfo(survey_id) {
    return new Promise(resolve => {
        pool.query('select * from submissions where survey_id = $1', [survey_id], (error, results) => {
            if (error) {
                throw error;
            }
            return resolve(results.rows[0]);
        });
    });
}

async function checkSubmissionExists(user_id,survey_id,uuid) {
    return new Promise(resolve => {
        pool.query('select * from submissions left join users on users.id = submissions.user_id where submissions.user_id = $1 and submissions.survey_id = $2 and users.uuid = $3', [user_id,survey_id,uuid], (error, results) => {
            if (error) {
              console.log(error);
              return;
            }
            return resolve(results.rowCount > 0);
        });
    });
}

async function insertSubmission(data) {
    return new Promise(function(resolve, reject) {
        pool.query(
            'INSERT INTO submissions (user_id,survey_id,comment,dateupdated) VALUES ($1, $2, $3,$4) RETURNING id',
            [data.user_id,data.survey_id,data.comment,date])
   
        .then(function(result) {
          resolve(result.rows[0].id);
        })
        .catch(function(err) {
          reject(err);
        });
    });
  }



  async  function updateSubmission(data) {
    return new Promise(function(resolve, reject) {

      pool.query("UPDATE submissions SET comment = $3 WHERE submissions.survey_id = $2 AND submissions.user_id = $1", [data.user_id,data.survey_id,data.comment])
          .then(function(result) {
            resolve(result.rows[0]);
          })
          .catch(function(err) {
            reject(err);
          });
    
    });
  }




  async function checkReviewExists(qid,user_id) {
    return new Promise(resolve => {
        pool.query('SELECT reviews.qid, reviews.ans,submissions.user_id FROM reviews,submissions WHERE reviews.submission_id=submissions.id AND reviews.qid = $1 AND submissions.user_id = $2', [qid,user_id], (error, results) => {
            if (error) {
                throw error;
            }
            return resolve(results.rowCount > 0);
            
        });
    });
}

async function insertReview(data) {
    return new Promise(function(resolve, reject) {
          pool.query(
            "INSERT INTO reviews (qid, ans, submission_id) VALUES ($1, $2, $3)",
            [data.qid,data.ans === "" ? null : data.ans,data.submission_id])
        .then(function(result) {
          resolve(result.rows[0]);
        })
        .catch(function(err) {
          reject(err);
        });
    });
  }

async function updateReview(data) {
    return new Promise(function(resolve, reject) {
        pool.query("UPDATE reviews SET ans = $3 WHERE reviews.qid = $2 and reviews.submission_id = $1", [data.submission_id,data.qid,data.ans])
        .then(function(result) {
          resolve(result.rows[0]);
        })
        .catch(function(err) {
          reject(err);
        });
    });
  }



  async function insertSurvey(data) {
    return new Promise(function(resolve, reject) {
        pool.query(
            'INSERT INTO survey (id,title,month,year,accesslevel,isactive,deleteflag,dateupdate) VALUES ($1, $2, $3,$4,$5,$6,$7,$8)',
            [data.id,data.title,month,year,accesslevel,isActive,deleteFlag,date])
   
        .then(function(result) {
          resolve(result.rows[0]);
        })
        .catch(function(err) {
          reject(err);
        });
    });
  }

  async function insertQuestion(data) {
    return new Promise(function(resolve, reject) {
        pool.query(
            'INSERT INTO questions (isactive,deleteflag,question,dateupdate) VALUES ($1, $2, $3,$4)',
            [isActive,deleteFlag,data.question,date])
   
        .then(function(result) {
          console.log("result",result);
          resolve(result.rows[0]);
        })
        .catch(function(err) {
          reject(err);
        });
    });
  }

  async function getWorkerinfo(id) {
    return new Promise(resolve => {
        pool.query('SELECT worker_supervisor_map.worker_id from worker_supervisor_map left join users u on u.id = worker_supervisor_map.supervisor_id where u.id = $1', [id], (error, results) => {
            if (error) {
                throw error;
            }
            return resolve(results.rows);
        });
    });
}




module.exports = {
  getSubmission,
  getSurvey,
    getSubinfo,
    updateReview,
    insertReview,
    checkReviewExists,
    updateSubmission,
    insertSubmission,
    checkSubmissionExists,
    getQuestionAnswer,
    getQuestion,
    insertSurvey,
    insertQuestion,
    getSubmissionId,
    getWorkerinfo
}