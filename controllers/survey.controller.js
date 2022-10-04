require("dotenv").config();
const { pool } = require("../config");
var Survey = require('./../models/survey');

let isActive = 1;
let deleteFlag = 0;
let role_id = 3;
const date = new Date();

const getSurveyData = async (request, response) => {
  let count = 0;
  let surveydata = [];
  let questiondata;
  let comment;

  await pool.query("SELECT * FROM survey", (error, results) => {
    let data = results.rows;
    if (error) {
      console.log("error", error);
      return response.status(400).json({
        status: "failed",
        message: error.code,
        statusCode: "400",
      });
    }
    data && data.length > 0 && data.forEach((element) => {
      pool.query(
        "select q.id, q.question, r.ans ,su.comment from questions q left join surveyquestions sq on sq.qu_id = q.id left join reviews r on r.qid = q.id  left join submissions su on su.survey_id= sq.survey_id where sq.survey_id = $1",
        [element.id], (error, results) => {
          if (error) {
            console.log("error", error);
            return response.status(400).json({
              status: "failed",
              message: "submissions query failed",
              statusCode: "400",
            });
          }
          else {

            questiondata = results.rows;

            questiondata.filter((question) => {
              comment = question.comment ? question.comment : "";
              question.ans = question.ans ? question.ans : "";
              pool.query;
            });

            count++;
            surveydata.push({
              id: element.id,
              title: element.title,
              comment: comment,
              question: questiondata,
            });

            if (count == data.length) {
              response
                .status(200)
                .json({
                  statusCode: "200",
                  message: "Success",
                  surveydata,
                });
            }
          }
        }
      );

    });



  });

};


const updateSurveyData = async function (req, res) {
  const formdata = req.body;
  console.log("user Data", req.body);
  let status = 200;
  let user_id = formdata.user_id;

  formdata.surveydata.forEach((element => {
    let submission_id = element.id;

    Survey.checkSubmissionExists(user_id, element.survey_id)
      .then(function (result) {
        if (result) {
          Survey.updateSubmission({ user_id, survey_id: element.survey_id, comment: element.comment })
            .then(function (result) {
              status = 200;
            })
        }
        else {
          Survey.insertSubmission({ id: element.id, user_id: user_id, survey_id: element.survey_id, comment: element.comment })
            .then(function (result) {
              status = 200;
            })
        }
      })
    element.question.forEach((que => {
      Survey.checkReviewExists(submission_id, que.qid)
        .then(function (result) {
          if (result) {
            Survey.updateReview({ id: submission_id, qid: que.qid, ans: que.ans })
              .then(function (result) {
                status = 200;
              })
          }
          else {
            Survey.insertReview({ submission_id, qid: que.qid, ans: que.ans })
              .then(function (result) {
                status = 200;
              })
              .catch(function () {
                status = 400;
              })
          }
        })
    }))
  }))

  if (status === 200) {
    let result = await Promise.resolve('Success');
    return res.send(result);
  } else if (status === 404) {
    let err = await Promise.resolve('page not found');
    return res.send(err);
  }
}




module.exports = {
  getSurveyData,
  updateSurveyData
};
