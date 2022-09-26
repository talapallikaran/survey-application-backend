require('dotenv').config();
const { pool } = require('../config');

let isActive = 1;
let deleteFlag = 0;
let role_id = 3;
const date = new Date();

async function getSurveyData1(survey_id) {
    return new Promise(resolve => {
        pool.query('SELECT survey.id,survey.title,q.questions, FROM survey as survey ON survey.id= survey.id LEFT JOIN question as q ON survey.id = q.id', [survey_id], (error, results) => {
            if (error) {
                throw error;
            }

            return resolve(results.rows[0]);
        });
    });
}


const getdata = (request, response) => {
    let count = 0;
    pool.query('SELECT * from survey', (error, results) => {
        console.log("result--->", results.rows);
        let data = results.rows
        data.forEach(item => {
            console.log("item--->", item);
            pool.query(
                "SELECT * from submissions where comment=$1",(comment) => {
                    item.forEach(item2 => {
                        pool.query("SELECT * FROM questions where id=$1 or question=$2", (id,question) => {
                            item2.forEach(item3 => {
                                count++;
                                if (error) {
                                    console.log("error", error)
                                    return response.status(400).json({
                                        status: 'failed',
                                        message: error.code,
                                        statusCode: "400"
                                    });
                                }

                                let users1 = data.rows.map(user => {
                                    return {
                                        title: user.title,
                                        question: user.question,
                                        ans: user.ans
                                    };
                                });

                                console.log("results", users1)
                                if (count == data.length) {
                                    response.status(200).json(users1);
                                }
                            })
                        })
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



const getSurveyData = async (request, response) => {
    console.log("request", request.body);
    const data = await request.body;
    let count = 0;
    const date = new Date();
    data.forEach(element => {
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
    getdata
}