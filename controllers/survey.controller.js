require("dotenv").config();
var Survey = require('./../models/survey');
var User = require('./../models/user');

const getSurveyData = async (request, response) => {
  let count = 0;
  let surveydata = [];
  let questiondata = [];
  let comment;
  let worker_uuid;
  let answerdata1 = [];
  let getsurvey = [];
  let worker = [];
  let workerdata = [];
  let name;
  let getworker = [];
  let wuuid;
  let user;
  let title;

  User.findOneById(request.params.uuid).then(isExists => {
    if (isExists) {
      user = request.params.uuid;
      Survey.getWorkerinfo(isExists.uuid)
        .then(function (result) {
          worker = result;
          
          worker.slice(0, 3).map((work) => {
            User.getUserId(work.worker_id)
              .then(function (result) {
             
                workerdata = result;
                name = workerdata[0].name
                worker_uuid = workerdata[0].uuid
              })
              .then(function () {
                getworker.push({
                  id: worker_uuid,
                  name: name
                })

              })

          })
        })
      Survey.getSurvey()
        .then(function (result) {
          if (result.length == 0) {
            return response.status(404).json({
              message: 'survey data not found'
            });
          }
          else {
            getsurvey = result;
            getsurvey.map((submission) => {

              if (request.params.uuid != undefined && request.query.wuuid != undefined) {
                worker_uuid = request.query.wuuid;

                Survey.getSupervisorsubmissions({ uuid: worker_uuid, survey_id: submission.id })
                  .then(function (result) {
                    let data = result;
                    if (result.length == 0) {
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
                            title: title,
                            comment: comment,
                            question: answerdata1
                          });

                          if (count === getsurvey.length) {
                            response
                              .status(200)
                              .json({
                                surveydata,
                                Workerdata: getworker
                              });
                          }
                        })
                    }
                    else {
                      data.map((element) => {
                        Survey.getSupervisorQuestionAnswer({ user_id: element.user_id, survey_id: element.survey_id })
                          .then(function (result) {
                            questiondata = result;
                            questiondata.map((que) => {
                              que.ans = que.ans ? que.ans : "";
                            })
                          })
                          .then(function () {
                            comment = element.comment ? element.comment : "";
                            count++;
                            surveydata.push({
                              survey_id: element.survey_id,
                              title: submission.title,
                              comment: comment,
                              question: questiondata,
                            });

                            if (count === getsurvey.length) {
                              response
                                .status(200)
                                .json({
                                  surveydata,
                                  Workerdata: getworker
                                });
                            }
                          })
                      })
                    }
                  })
              }
              else {
                Survey.getSubmission({ uuid: user, survey_id: submission.id })
                  .then(function (result) {
                    let data = result;

                    if (result.length == 0) {
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
                            title: title,
                            question: answerdata1
                          });

                          if (count === getsurvey.length) {
                            response
                              .status(200)
                              .json({
                                surveydata,
                                Workerdata: getworker
                              });
                          }
                        })
                    }
                    else {
                      data.map((element) => {
                        console.log("data", data);
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
                            surveydata.push({
                              survey_id: element.survey_id,
                              title: submission.title,
                              comment: comment,
                              question: questiondata,
                            });

                            if (count === getsurvey.length) {
                              response
                                .status(200)
                                .json({
                                  surveydata,
                                  Workerdata: getworker
                                });
                            }
                          })
                      })
                    }
                  })
              }

            })
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

  User.findOneById(req.body.uuid).then(async isExists => {
    if (isExists) {
      formdata.surveydata.forEach((element => {
        let sub;
        let update_sub;
        if (req.body.uuid != undefined && req.body.wuuid != undefined) {
          worker_uuid = req.body.wuuid;
          User.findOneById(worker_uuid).then(async isWorker => {
            if (isWorker) {
              let sub1;
              let update_sub1;
              if (element.comment != '') {
                Survey.checkSupervisorSubmissionExists(isWorker.id, element.survey_id, worker_uuid)
                  .then(async function (result) {
                    if (result) {
                      update_sub1 = await Survey.updateSupervisorSubmission({ worker_id: isWorker.id, survey_id: element.survey_id, comment: element.comment }).then(result => {
                        if (result) {
                          res.statusCode = 200;
                        }
                        return result;
                      })
                        .catch(function (err) {
                          if (err) {
                            res.statusCode = 400;
                          }
                        });
                    }
                    else {
                      sub1 = await Survey.insertSupervisorSubmission({ worker_id: isWorker.id, user_id: isExists.id, survey_id: element.survey_id, comment: element.comment }).then(result => {
                        if (result) {
                          res.statusCode = 200;
                        }
                        return result;
                      })
                        .catch(function (err) {
                          if (err) {
                            res.statusCode = 400;
                          }
                        });
                    }

                    element.question.forEach((que => {
                      Survey.checkSupervisorReviewExists(isWorker.id, que.qid)
                        .then(function (result) {

                          if (result) {
                            Survey.updateSupervisorReview({ sv_submission_id: update_sub1, qid: que.qid, ans: que.ans })
                              .then(function () {
                                if (result) {
                                  res.statusCode = 200;
                                }
                              })
                              .catch(function (err) {
                                if (err) {
                                  res.statusCode = 400;
                                }
                              });
                          }
                          else {
                            Survey.insertSupervisorReview({ qid: que.qid, ans: que.ans, sv_submission_id: sub1 })
                              .then(function (result) {
                                console.log("result4");
                                if (result) {
                                  res.statusCode = 200;
                                }
                              })
                              .catch(function (err) {
                                if (err) {
                                  res.statusCode = 400;
                                }
                              });
                          }
                        })

                    }))
                  })
              }
            }
          })
        }

        else {

          if (element.comment != '') {

            Survey.checkSubmissionExists(isExists.id, element.survey_id, req.body.uuid)
              .then(async function (result) {
                if (result) {
                  update_sub = await Survey.updateSubmission({ user_id: isExists.id, survey_id: element.survey_id, comment: element.comment }).then(result => {
                    if (result) {
                      res.statusCode = 200;
                    }
                    return result;
                  })
                    .catch(function (err) {
                      if (err) {
                        res.statusCode = 400;
                      }

                    });
                }
                else {
                  sub = await Survey.insertSubmission({ user_id: isExists.id, survey_id: element.survey_id, comment: element.comment }).then(result => {
                    if (result) {
                      res.statusCode = 200;
                    }
                    return result;
                  })
                    .catch(function (err) {
                      if (err) {
                        res.statusCode = 400;
                      }
                    });
                }

                element.question.forEach((que => {

                  Survey.checkReviewExists(que.qid, isExists.id)
                    .then(function (result) {
                      if (result) {
                        Survey.updateReview({ submission_id: update_sub, qid: que.qid, ans: que.ans })
                          .then(function (result) {
                            if (result) {
                              res.statusCode = 200;
                            }
                          })
                          .catch(function (err) {
                            if (err) {
                              res.statusCode = 400;
                            }
                          });
                      }
                      else {
                        Survey.insertReview({ submission_id: sub, qid: que.qid, ans: que.ans })
                          .then(function (result) {
                            console.log("result4", result);
                            if (result) {
                              res.statusCode = 200;
                            }
                          })
                          .catch(function (err) {
                            if (err) {
                              res.statusCode = 400;
                            }
                          });
                      }
                    })

                }))
              })
          }
        }
      }))
    }
    else {
      res.statusCode = 404;
    }

    if (res.statusCode === 200) {
      let result = await Promise.resolve('Success');
      return res.send(result);
    }
    else if (res.statusCode === 400) {
      let err1 = await Promise.resolve('Error');
      return res.send(err1);
    } else if (res.statusCode === 404) {
      let err = await Promise.resolve('uuid is invalid');
      return res.send(err);
    } else if (res.statusCode === 500) {
      let err3 = await Promise.resolve('question data is blank');
      return res.send(err3);
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
  question.questiondata.forEach((que) => {

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
