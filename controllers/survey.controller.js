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
    let count = 0;
    const date = new Date();
    data?.ans.forEach(element => {
        pool.query(
            "DELETE FROM SURVEY WHERE SURVEY.question_id = $1 AND SURVEY.survey_id = $2",
            [element.question_id, data.survey_id]
        ).then(function () {
            pool.query('INSERT INTO SURVEY (user_id,question_id,survey_id,answer,date) VALUES ($1, $2, $3, $4, $5)', [data.user_id, element.question_id, data.survey_id, element.answer, date]);
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
    updateSurvey
}