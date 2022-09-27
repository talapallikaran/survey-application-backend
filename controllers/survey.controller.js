require("dotenv").config();
const { pool } = require("../config");

let isActive = 1;
let deleteFlag = 0;
let role_id = 3;
const date = new Date();

const getSurveyData = async (request, response) => {
    let count = 0;
    let surveydata = [];
    let questiondata;
    let comment;
    await  pool.query("SELECT * FROM survey", (error, results) => {
        let data = results.rows;
        if (error) {
            console.log("error", error);
            return response.status(400).json({
                status: "failed",
                message: error.code,
                statusCode: "400",
            });
        }
        data && data.length > 0 && data.forEach(  (element) => {
          
             pool.query(
                    "select * from submissions where survey_id = $1",
                    [element.id],(error, results) => { 
                        if (error) {
                            console.log("error", error);
                            return response.status(400).json({
                                status: "failed",
                                message: "submissions query failed",
                                statusCode: "400",
                            });
                        } 
                        else {
                            
                            let submissionData = results.rows;
                            console.log("submissionData--->", submissionData);
                            if (submissionData && submissionData.length > 0) {
                                comment = submissionData[0].comment;
                            } else {
                                comment = "";
                            }

                            pool.query(
                                "select q.id, q.question, r.ans from questions q left join surveyquestions sq on sq.qu_id = q.id left join reviews r on r.qid = q.id where sq.survey_id = $1",
                                [element.id],
                                (error, results) => {
                                    if (error) {
                                        console.log("error", error);
                                        return response.status(400).json({
                                            status: "failed",
                                            message: "Reviews query failed",
                                            statusCode: "400",
                                        });
                                    } else {
                                        questiondata = results.rows;
                                        questiondata.forEach((question) => {
                                            
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
                        }
                    }
                );
            });
    });
};

const updateSurvey = async (request, response) => {
    console.log("request", request.body);
    const data = await request.body;
    let count = 0;
    const date = new Date();
    data?.ans.forEach((element) => {
        pool
            .query("DELETE FROM SURVEY WHERE survey.id = $1", [data.survey_id])
            .then(function () {
                pool.query(
                    "INSERT INTO survey (user_id,question_id,survey_id,answer,date) VALUES ($1, $2, $3, $4, $5)",
                    [
                        data.user_id,
                        element.question_id,
                        data.survey_id,
                        element.answer,
                        date,
                    ]
                );
                count++;
                if (count === data?.ans.length) {
                    return response.status(201).json({ status: "Sucees" });
                }
            })
            .catch(function (err) {
                return response.status(400).json({ status: "failed", message: err });
            });
    });
};

module.exports = {
    updateSurvey,
    getSurveyData,
};
