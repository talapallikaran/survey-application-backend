require('dotenv').config();
const { pool } = require('../config');



async function getSurveyData(user_id) {
    return new Promise(resolve => {
        pool.query('SELECT * FROM SURVEY WHERE user_id = $1', [user_id], (error, results) => {
            if (error) {
                throw error;
            }

            return resolve(results.rows[0]);
        });
    });
}

const updateSurvey = async (request, response) => {
    console.log("request", request.body);
    const data = await request.body;
    const date = new Date();
    data.forEach(element => {
        console.log("First ---->", element.survey_id, element.question_id, element.user_id, element.answer);
        pool.query(
            "SELECT EXISTS (SELECT * FROM SURVEY WHERE SURVEY.question_id = $1 AND SURVEY.survey_id = $2 AND SURVEY.user_id = $3)",
            [element.question_id, element.survey_id, element.user_id],
            (error, results) => {
                if (error) {
                    return response.status(400).json({ status: 'failed', message: error.code });
                }

                if (results.rows[0].exists) {
                
                    pool.query("UPDATE SURVEY SET answer = $4 WHERE SURVEY.question_id = $1 AND SURVEY.survey_id = $2 AND SURVEY.user_id = $3", [element.question_id, element.survey_id, element.user_id, element.answer]);
                   
                    return response.status(200).json({
                        status: "success",
                        message: `SURVEY Data Updtaed successfully`,
                    });
                
                } else {
                    
                    pool.query('INSERT INTO SURVEY (user_id,question_id,survey_id,answer,date) VALUES ($1, $2, $3, $4, $5)', [element.user_id, element.question_id, element.survey_id, element.answer, date], error => {
                        if (error) {
                            console.log("error", error);
                            return response.status(400).json({ status: 'failed', message: error.code });
                        } else {
                            getSurveyData(element.user_id).then(user => {
                                user = {
                                    id: user.user_id,
                                    question_id: user.question_id,
                                    survey_id: user.survey_id,
                                    answer: user.answer
                                };

                                response.status(201).json(element);
                            });
                        }
                    });
                }

            }
        );
    });



};


module.exports = {
    updateSurvey
}