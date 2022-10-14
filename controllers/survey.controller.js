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
  let answerdata1 = [];
  let getsurvey = [];
  let worker = [];
  let workerdata = [];
  let name ;

  User.findOneById(request.params.uuid).then(isExists => {
    if (isExists) {
      uuid = request.params.uuid;
      Survey.getSurvey()
        .then(function (result) {
          getsurvey = result;
          getsurvey.map((submission) => {
            Survey.getSubmission({ uuid ,survey_id:submission.id})
              .then(function (result) {
                if (result) {
                  let data = result;
                  if (data == '') {
                      Survey.getQuestion({ survey_id: submission.id })
                        .then(function (result) {
                          answerdata1 = result;
                          answerdata1.map((ans1) => {
                            ans1.ans = "";
                          })
                          comment = submission.comment ? submission.comment : "";
                          id = submission.id ? submission.id : "";
                          title = submission.title ? submission.title : "";
                          count++;
                          surveydata.push({
                            survey_id: id,
                            comment: comment,
                            question:answerdata1
                          });

                          if (count === getsurvey.length) {
                            response
                              .status(200)
                              .json({
                                surveydata
                              });
                          }
                        })
                  }

                  else {
                    data.map((element) => {
                      Survey.getQuestionAnswer({ user_id: element.user_id, survey_id: element.survey_id })
                        .then(function (result) {
                          questiondata = result;
                          questiondata.map((que) => {
                            que.ans = que.ans ? que.ans : "";
                          })
                        })
                        .then(function () {
                          comment = element.comment ? element.comment : "";
                          count++;
                          console.log("count",count);
                          surveydata.push({
                            survey_id: element.survey_id,
                            comment: comment,
                            question:questiondata
                          });

                          if (count === getsurvey.length) {
                            response
                              .status(200)
                              .json({
                                surveydata
                              });
                          }
                        })
                    })
                  }
                }
              })

            Survey.getWorkerinfo(isExists.id)
            .then(function(result){
              worker = result;
              worker.map((work)=>{
                User.getUserId(work.worker_id)
                .then(function(result){
                  workerdata = result;
                  name = workerdata[0].name
                  console.log("workerdata","id",work.worker_id,"name",name);
                })
              })
              
            
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

  User.findOneById(req.body.uuid).then(async isExists => {
    if (isExists) {
      formdata.surveydata.forEach((element => {
        let sub;
        Survey.checkSubmissionExists(isExists.id, element.survey_id, req.params.uuid)
          .then(async function (result) {
            if (result) {
              Survey.updateSubmission({ user_id:isExists.id, survey_id: element.survey_id, comment: element.comment })
                .then(function (result) {
                  console.log("result", result);
                  res.statusCode = 200;
                })
                .catch(function (err) {
                  res.statusCode = 400;
                });
            }
            else {
              sub = await Survey.insertSubmission({ user_id: isExists.id, survey_id: element.survey_id, comment: element.comment }).then(result => {
                res.statusCode = 200;
                return result;

              })
                .catch(function (err) {
                  res.statusCode = 400;
                });
            }
            element.question.forEach((que => {
              Survey.checkReviewExists(que.qid, isExists.id)
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
                    Survey.insertReview({ submission_id: sub, qid: que.qid, ans: que.ans })
                      .then(function (result) {
                        console.log("result4", result);
                        res.statusCode = 200;
                      })
                      .catch(function (err) {
                        res.statusCode = 400;
                      });
                  }
                })

            }))
          })
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

const createSurvey = (req, res) => {

  Survey.insertSurvey(req.body)
    .then(function (result) {
      return res.status(200).json({
        message: 'success! inserted survey data'
      });
    })
    .catch(function (err) {
      return res.status(400).json({
        message: err
      });
    });
}

const createQuestion = (req, res) => {
  const question = req.body;
  question.questiondata.forEach((que)=>{

    Survey.insertQuestion(que)
    .then(function (result) {
    })
    .catch(function (err) {
      return res.status(400).json({
        message: err
      });
    });
  })

}



module.exports = {
  getSurveyData,
  updateSurveyData,
  createSurvey,
  createQuestion
};
