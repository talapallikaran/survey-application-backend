const { pool } = require('../config');

async function getSurveyinfo() {
    return new Promise(resolve => {
        pool.query('SELECT * FROM survey', (error, results) => {
            if (error) {
                throw error;
            }

            return resolve(results.rows);
        });
    });
}

async function getSubinfo(survey_id) {
    return new Promise(resolve => {
        pool.query('select * from submissions where survey_id = $1', [survey_id], (error, results) => {
            if (error) {
                throw error;
            }

            return resolve(results.rows[0]);
        });
    });
}


module.exports = {
    getSurveyinfo,
    getSubinfo
}