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


const updateSurveyData =async function(req, res) {
    const {user_id,survey_id,comment,id,qid,ans} = req.body;
    console.log("user_id",req.body);

    Survey.checkSubmissionExists(user_id,survey_id)
      .then(function(result) {
        if(result){
            Survey.updateSubmission( user_id, survey_id, comment)
            .then(function(result) {
                return res.status(200).json({result,message:"update successfully"}); 
              })
              .catch(function(err) {
                return res.status(400).json({
                  message: "update submission failed"
                });
              });
        }
        else{
            console.log("user_id,survey_id,comment ===>",id,user_id,survey_id,comment);
            Survey.insertSubmission({id,user_id,survey_id,comment})
            .then(function(result) {
                return res.status(200).json({result,message:"insert successfully"}); 
              })
              .catch(function(err) {
                return res.status(400).json({
                  message: "insert submission failed"
                });
              });
        }
        Survey.checkReviewExists(id,qid)
        .then(function(result){
            if(result){
              Survey.updateReview( id, qid, ans)
              .then(function(result){
                console.log("result",result);
                  console.log("updateReview",result);
                  return res.status(200).json(result); 
              })
            } 
        })
      })
      .catch(function(err) {
        return res.status(400).json({
          message: err
        });
      });
     
  }

module.exports = {
    getSurveyData,
    updateSurveyData
};
