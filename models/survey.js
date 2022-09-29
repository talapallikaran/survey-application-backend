const { pool } = require('../config');

async function getSurveyinfo() {
    return new Promise(resolve => {
        pool.query('SELECT * FROM survey', (error, results) => {
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

async function checkSubmissionExists(user_id,survey_id) {
    return new Promise(resolve => {
        pool.query('select * from submissions where user_id = $1 and survey_id = $2', [user_id,survey_id], (error, results) => {
            if (error) {
                throw error;
            }
            console.log("results.rowCount ===>", results.rowCount);
            return resolve(results.rowCount > 0);
        });
    });
}

async function insertSubmission(data) {
    return new Promise(function(resolve, reject) {
    (function() {
          return pool.query(
            'INSERT INTO submissions (id, user_id, survey_id, comment) VALUES ($1, $2, $3,$4) returning id',
            [data.id,data.user_id, data.survey_id, data.comment]);
        })
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
            console.log("result=====",result.rows[0]);
            resolve(result.rows[0]);
          })
          .catch(function(err) {
            reject(err);
          });
    
    });
  }




  async function checkReviewExists(submission_id,q_id) {
    return new Promise(resolve => {
        pool.query('select * from reviews where submission_id = $1 and qid = $2 ', [submission_id,q_id], (error, results) => {
            if (error) {
                throw error;
            }
            return resolve(results.rowCount > 0);
        });
    });
}

async function insertReview(data) {
    return new Promise(function(resolve, reject) {
    (function() {
          return pool.query(
            'INSERT INTO reviews (id, qid, ans, submission_id) VALUES ($1, $2, $3,$4)',
            [data.id,data.q_id,data.ans,data.submission_id]);
        })
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
    (function() {
          return pool.query("UPDATE reviews SET ans = $3 WHERE reviews.qid = $2 AND reviews.submission_id = $1", [data.submission_id,data.survey_id,data.comment]);
        })
        .then(function(result) {
          resolve(result.rows[0]);
        })
        .catch(function(err) {
          reject(err);
        });
    });
  }


module.exports = {
    getSurveyinfo,
    getSubinfo,
    updateReview,
    insertReview,
    checkReviewExists,
    updateSubmission,
    insertSubmission,
    checkSubmissionExists
}