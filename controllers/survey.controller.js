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
  let questiondata = [];
  let answerdata;
  let comment;
  let arr = [];
  let ans;
  let dataquestion = []

  User.findOneById(request.params.uuid).then(isExists => {
    if (isExists) {
      Survey.getSubmission({ uuid: request.params.uuid })
        .then(function (result) {
          if (result) {
            let data = result;
            console.log("data", data);
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
                  
                    questiondata.forEach((question) => {
                    Survey.getReview({id:question.id,survey_id: element.survey_id, user_id: element.user_id})
                      .then(function(result){
                        if(result){
                          answerdata =  result;
                          ans =  answerdata[0].ans;
                          // var obj = {};
                 
                          //  obj['ans'] =  ans;
                          answerdata.forEach(id => questiondata.push({ans:id.ans})
                          );
                          console.log("routes",answerdata);
                        }
                        else{
                          ans =  "";
                        }
                      })
                    });
                
                  })
                  .then(function () {
                    comment = element.comment ? element.comment : "";
                    count++;
                    surveydata.push({
                      id: element.survey_id,
                      title: element.title,
                      comment: comment,
                      questiondata
                    });
                    if (count == data.length) {
                      response
                        .status(200)
                        .json({
                          statusCode: "200",
                          message: "Success",
                          surveydata
                        });
                    }
                  })
              })
            }
          }
        })
    }
    else {
      return response.status(400).json({
        status: 'failed',
        message: 'uuid is invalid'
      });
    }
  });
};


const updateSurveyData = async function (req, res) {
  const formdata = req.body;
  console.log("user Data", req.body);
  let user_id = formdata.user_id;



  User.findOneById(req.params.uuid).then(async isExists => {
    console.log(isExists);
    if (isExists) {

      formdata.surveydata.forEach((element => {
        let submission_id = element.id;

        Survey.checkSubmissionExists(user_id, element.survey_id, req.params.uuid)
          .then(function (result) {
            if (result) {
              Survey.updateSubmission({ user_id, survey_id: element.survey_id, comment: element.comment })
                .then(function (result) {
                  console.log("result", result);
                  res.statusCode = 200;
                })
                .catch(function(err) {
                  res.statusCode = 400;
                });
            }
            else {
              Survey.insertSubmission({ id: element.id, user_id: user_id, survey_id: element.survey_id, comment: element.comment })
                .then(function (result) {
                  res.statusCode = 200;
                })
                .catch(function(err) {
                  res.statusCode = 400;
                });
            }
          })
        element.question.forEach((que => {

          Survey.checkReviewExists(submission_id, que.qid)
            .then(function (result) {
              if (result) {
                Survey.updateReview({ submission_id, qid: que.qid, ans: que.ans })
                  .then(function (result) {

                    console.log("result3", result);
                    res.statusCode = 200;
                  })
                  .catch(function(err) {
                    res.statusCode = 400;
                  });
              }
              else {
                Survey.insertReview({ submission_id, qid: que.qid, ans: que.ans })
                  .then(function (result) {
                    console.log("result4", result);
                    res.statusCode = 200;
                  })
                  .catch(function(err) {
                    res.statusCode = 400;
                  });
              }
            })
        }))
      }))
    }
    else {
      res.statusCode = 404;
      console.log("404");
    }
    if (res.statusCode === 200) {
      let result = await Promise.resolve('Success');
      return res.send(result);
    } else if (res.statusCode === 400) {
      let err1 = await Promise.resolve('Error');
      return res.send(err1);
    } else if (res.statusCode === 404) {
      let err = await Promise.resolve('uuid is invalid');
      return res.send(err);
    }
  });
}




module.exports = {
  getSurveyData,
  updateSurveyData
};
