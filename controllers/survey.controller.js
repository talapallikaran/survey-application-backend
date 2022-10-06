require("dotenv").config();
const { pool } = require("../config");
var Survey = require('./../models/survey');
var User = require('./../models/user');

let isActive = 1;
let deleteFlag = 0;
let role_id = 3;
const date = new Date();

const getSurveyData = async (request, response) => {
  let count = 0;
  let surveydata = [];
  let questiondata;
  let comment;


  Survey.getSubmission({ uuid: request.params.uuid })
    .then(function (result) {
      if (result) {
        let data = result;
        console.log("data",data);
        if (data == '') {
          response
            .status(204)
            .json({
              statusCode: "204",
              message: "No data Found"
            });
        }
        else {
          data.forEach((element) => {
            Survey.getSurvey({ survey_id: element.survey_id, user_id: element.user_id })
              .then(function (result) {
                questiondata = result;
                console.log("questiondata",questiondata);
                questiondata.forEach((question) => {
                  question.ans = question.ans ? question.ans : "";
                  pool.query;
                });

              })
              .then(function () {
                comment = element.comment ? element.comment : "";
                count++;
                surveydata.push({
                  id: element.survey_id,
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
              })
          })
        }
      }
    })
};


const updateSurveyData = async function (req, res) {
  const formdata = req.body;
  console.log("user Data", req.body);
  let status = 200;
  let user_id = formdata.user_id;

  formdata.surveydata.forEach((element => {
    let submission_id = element.id;

    Survey.checkSubmissionExists(user_id, element.survey_id,req.params.uuid)
      .then(function (result) {
        if (result) {
          Survey.updateSubmission({ user_id, survey_id: element.survey_id, comment: element.comment })
            .then(function (result) {
              console.log("result",result);
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
            Survey.updateReview({ submission_id, qid: que.qid, ans: que.ans })
              .then(function (result) {
                
                console.log("result3",result);
                status = 200;
              })
          }
          else {
            Survey.insertReview({ submission_id, qid: que.qid, ans: que.ans })
              .then(function (result) {
                console.log("result4",result);
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
    let err = await Promise.resolve('Error');
    return res.send(err);
  }
}




module.exports = {
  getSurveyData,
  updateSurveyData
};
