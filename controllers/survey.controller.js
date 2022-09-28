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

const updateSurveyData = (request, response) => {
    const { user_id, question_id, survey_id, answer } = request.body;
    const date = new Date();
    pool.query(
        "SELECT EXISTS (SELECT * FROM submissions WHERE user_id = $1)",
        [user_id],
        (error, results) => {
            if (error) {
                throw error;
            }
            if (results.rows[0].exists) {
                console.log("exists",  user_id);
               
            } 
            else {
                console.log("id:",  results);
                 response.status(201).json({ status: "success"});
                
            }
        }
    );
};






module.exports = {
    updateSurvey,
    getSurveyData,
    updateSurveyData
};
