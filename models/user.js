const { pool } = require('../config');


async function isUserExists(email) {
    return new Promise(resolve => {
        pool.query('SELECT * FROM users WHERE email = $1', [email], (error, results) => {
            if (error) {
                throw error;
            }

            return resolve(results.rowCount > 0);
        });
    });
}

async function getUser(email, uuid) {
    return new Promise(resolve => {
        pool.query('SELECT * FROM users WHERE email = $1 or uuid = $2', [email, uuid], (error, results) => {
            if (error) {
                throw error;
            }

            return resolve(results.rows[0]);
        });
    });
}


module.exports = {
    isUserExists,
    getUser
}