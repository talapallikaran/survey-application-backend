require("dotenv").config();
var Survey = require('./../models/survey');
var User = require('./../models/user');


const getSurveyData = async (request, response) => {
  let count = 0;
  let surveydata = [];
  let questiondata = [];
  let comment;
  let id;
  let title;
  let questiondata1 = [];
  let answerdata1 = [];
  let surveydata1 = [];
  let count1 = 0;
  let survey = [];

  User.findOneById(request.params.uuid).then(isExists => {
    if (isExists) {
      uuid = request.params.uuid;
      Survey.getSurvey()
        .then(function (result) {
          survey = result;
          survey.forEach((submission) => {
            Survey.getSubmission({ uuid })
              .then(function (result) {
                if (result) {
                  let data = result;
                  if (data == '') {

                        survey.forEach((que) => {
                          Survey.getQuestion({ survey_id: que.id })
                            .then(function (result) {
                              answerdata1 = result;
                              answerdata1.forEach((ans1) => {
                                ans1.ans = "";
                              })
                              comment = que.comment ? que.comment : "";
                              id = que.id ? que.id : "";
                              title = que.title ? que.title : "";
                              count1++;
                              surveydata1.push({
                                id: id,
                                title: title,
                                comment: comment,
                                question: answerdata1
                              });
                              if (count1 === survey.length) {
                                response
                                  .status(200)
                                  .json({
                                    statusCode: "200",
                                    message: "Success",
                                    surveydata1
                                  });
                              }
                            })
                        })
                    
                  }

              else {
                  data.forEach((element) => {
                    Survey.getQuestionAnswer({ user_id: element.user_id, survey_id: element.survey_id })
                      .then(function (result) {
                        questiondata = result;
                        questiondata.forEach((que) => {
                          que.ans = que.ans ? que.ans : "";
                        })
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

                        if (count === data.length) {
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
          })
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
        let submission_id ;
        Survey.checkSubmissionExists(user_id, element.survey_id, req.params.uuid)
          .then(function (result) {
            if (result) {
              Survey.updateSubmission({ user_id, survey_id: element.survey_id, comment: element.comment })
                .then(function (result) {
                  console.log("result", result);
                  res.statusCode = 200;
                })
                .catch(function (err) {
                  res.statusCode = 400;
                });
            }
            else {
              Survey.insertSubmission({ user_id: user_id, survey_id: element.survey_id, comment: element.comment })
                .then(function (result) {
                  if(result){
                    submission_id = result; 
                  }
                  res.statusCode = 200;
                })
                .catch(function (err) {
                  res.statusCode = 400;
                });
            }
          })
        element.question.forEach((que => {
        
          Survey.checkReviewExists(que.qid,user_id)
            .then(function (result) {
              if (result) {
                Survey.updateReview({ qid: que.qid, ans: que.ans })
                  .then(function (result) {

                    console.log("result3", result);
                    res.statusCode = 200;
                  })
                  .catch(function (err) {
                    res.statusCode = 400;
                  });
              }
              else {
                Survey.getSubmissionId()
                    .then(function (result){
                      console.log("result",result);
                      let submission_id1 = result;

                      submission_id1.forEach((sub)=>{
                        Survey.insertReview({ submission_id:sub.max,qid: que.qid, ans: que.ans })
                        .then(function (result) {
                          console.log("result4", result);
                          res.statusCode = 200;
                        })
                        .catch(function (err) {
                          res.statusCode = 400;
                        });
                      })
                      
                    }) 
              
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

const createSurvey =  (req, res) => {

      Survey.insertSurvey(req.body)
      .then(function(result) {
        return res.status(200).json({
          message: 'success! inserted survey data'
        });
  })
      .catch(function(err) {
        return res.status(400).json({
          message: err
        });
      });
  }





module.exports = {
  getSurveyData,
  updateSurveyData,
  createSurvey
};
