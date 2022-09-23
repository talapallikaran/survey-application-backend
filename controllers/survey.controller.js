require('dotenv').config();
const { pool } = require('../config');

let isActive = 1;
let deleteFlag = 0;
let role_id = 3;
const date = new Date();


const getSurveyData = async (request, response) => {
    let count = 0;
    let surveydata = [];
    pool.query('SELECT * FROM survey', (error, results) => {
        console.log("result--->", results.rows);
        let data = results.rows;
        if (error) {
            console.log("error", error)
            return response.status(400).json({
                status: 'failed',
                message: error.code,
                statusCode: "400"
            });
        }
         data.forEach(element => {
            pool.query(
                "SELECT * FROM submissions WHERE survey_id = $1", [element.id], (error, results) => {
                    console.log("submissionData--->", results);
                    let submissionData = results.rows;
                    
                    if (error) {
                        console.log("error", error)
                        return response.status(400).json({
                            status: 'failed',
                            message: error.code,
                            statusCode: "400"
                        });
                    }
                    if(submissionData && submissionData.length > 0){
                        comment = submissionData[0].comment;
                    }
                    else{
                        comment = ''
                    }
                    pool.query("select q.id, q.question from questions q join surveyquestions sq on sq.qu_id = q.id where  sq.survey_id = $1",[element.id],(error, results) => {
   
                        if (error) {
                            console.log("error", error)
                            return response.status(400).json({
                                status: 'failed',
                                message: error.code,
                                statusCode: "400"
                            });
                        }
                        let questiondata = results.rows;
                        questiondata.forEach(question=>{
                            console.log("question---->",question)
                            pool.query;
                        })
                        count++;
                        surveydata.push({ title: element.title, Comment: comment,question:questiondata })

                        if (count == data.length) {
                            response.status(200).json({ statusCode: "200", message: "Success", surveydata });
                        }
                    })
                  

                }
            )
        })

    });

};


const updateSurvey = async (request, response) => {
    console.log("request", request.body);
    const data = await request.body;
    let count = 0;
    const date = new Date();
    data?.ans.forEach(element => {
        pool.query(
            "DELETE FROM SURVEY WHERE survey.id = $1",
            [data.survey_id]
        ).then(function () {
            pool.query('INSERT INTO survey (user_id,question_id,survey_id,answer,date) VALUES ($1, $2, $3, $4, $5)', [data.user_id, element.question_id, data.survey_id, element.answer, date]);
            count++;
            if (count === data?.ans.length) {
                return response.status(201).json({ status: 'Sucees' })
            }
        })
            .catch(function (err) {
                return response.status(400).json({ status: 'failed', message: err });
            });
    });
};


module.exports = {
    updateSurvey,
    getSurveyData
}