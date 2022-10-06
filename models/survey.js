const { pool } = require('../config');
const date = new Date();

async function getSubmission(data) {
    return new Promise(resolve => {
        pool.query('SELECT users.id,submissions.user_id,submissions.comment,submissions.survey_id FROM submissions LEFT JOIN users ON users.id = submissions.user_id WHERE users.uuid = $1 ',[data.uuid], (error, results) => {
            if (error) {
                throw error;
            }
            return resolve(results.rows);
        });
    });
}

async function getSurvey(data) {
  return new Promise(resolve => {
      pool.query('select q.id, q.question, r.ans from questions q left join surveyquestions sq on sq.qu_id = q.id left join reviews r on r.qid = q.id left join submissions su on su.id= sq.survey_id where sq.survey_id = $1 AND su.user_id = $2',[data.survey_id,data.user_id],(error, results) => {
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
            'INSERT INTO submissions (id,user_id,survey_id,comment,dateupdated) VALUES ($1, $2, $3,$4,$5)',
            [data.id,data.user_id,data.survey_id,data.comment,date])
   
        .then(function(result) {
          resolve(result.rows[0]);
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




  async function checkReviewExists(submission_id,qid) {
    return new Promise(resolve => {
        pool.query('select * from reviews where submission_id = $1 and qid = $2', [submission_id,qid], (error, results) => {
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
            [data.qid,data.ans,data.submission_id])
        .then(function(result) {
          console.log("insertReview=====",result.rows[0]);
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


module.exports = {
  getSubmission,
    getSubinfo,
    updateReview,
    insertReview,
    checkReviewExists,
    updateSubmission,
    insertSubmission,
    checkSubmissionExists,
    getSurvey
}