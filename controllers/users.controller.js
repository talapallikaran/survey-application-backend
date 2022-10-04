require('dotenv').config();
const { pool } = require('../config');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const uuid = require("uuid");
const uid = uuid.v4();
var User = require('./../models/user');


let isActive = 1;
let deleteFlag = 0;
let role_id = 3;





const getUsers = (request, response) => {
    pool.query('SELECT * FROM users', (error, results) => {
        if (error) {
            return response.status(400).json({ 
                status: 'failed', 
                message: error.code, 
                statusCode: "400" });
        }

        const users = results.rows.map(user => {
            return {
                id: user.id,
                name: user.name,
                email: user.email
            };
        });

        response.status(200).json(users);
    });
};


const createUser = (request, response) => {
    const saltRounds = 10;
    const { id, name, email, password, phone } = request.body;
    const date = new Date();


    if (!name || name.length === 0) {
        return response.status(400).json({ 
            status: 'failed', 
            message: 'Name is required.', 
            statusCode: "400" });
    }

    if (!email || email.length === 0) {
        return response.status(400).json({ 
            status: 'failed', 
            message: 'Email is required.', 
            statusCode: "400" });
    }

    if (!password || password.length === 0) {
        return response.status(400).json({ 
            status: 'failed', 
            message: 'Password is required', 
            statusCode: "400" });
    }

    if (!phone || phone.length === 0) {
        return response.status(400).json({
            status: 'failed',
            message: 'Password is required',
            statusCode: "400"
        });
    }

    if (!role_id || role_id.length === 0) {
        return response.status(400).json({
            status: 'failed',
            message: 'Password is required',
            statusCode: "400"
        });
    }


    User.isUserExists(email).then(isExists => {
        if (isExists) {
            return response.status(400).json({
                status: 'failed',
                message: 'Email is taken.'
            });
        }

        bcrypt.hash(password, saltRounds, (error, encryptedPassword) => {
            if (error) {
                throw error;
            }
            pool.query('INSERT INTO users (id,name, email,phone,role_id,isactive,deleteflag,password,uuid,updateddate) VALUES ($1, $2, $3, $4, $5, $6, $7, $8,$9,$10)', [id, name, email, phone, role_id, isActive, deleteFlag, encryptedPassword, uid, date], error => {
                if (error) {
                    console.log("error", error);
                    return response.status(400).json({
                        status: 'failed',
                        message: error.code,
                        statusCode: "400"
                    });
                }

                getUser(email).then(user => {
                    user = {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        phone: user.phone,
                        role_id: role_id,
                        isActive: isActive,
                        deleteFlag: deleteFlag,
                        password: user.password,
                        uuid: uuid
                    };

                    response.status(201).json({
                        status: 'Success',
                        message: 'Success',
                        data: user, statusCode: "201"
                    });
                });
            });
        });
    }, error => {
        response.status(400).json({
            status: 'failed',
            message: 'Error while checking is user exists.',
            statusCode: "400"
        });
    });
};


const login = (request, response) => {
    const { email, password } = request.body;

    User.isUserExists(email).then(isExists => {
        if (!isExists) {
            return response.status(401).json({
                status: 'failed',
                message: 'Invalid email or password!'
            });
        }

        User.getUser(email, uuid).then(user => {
            bcrypt.compare(password, user.password, (error, isValid) => {
                if (error) {
                    throw error;
                }
                if (!isValid) {
                    return response.status(401).json({
                        status: 'failed',
                        message: 'Invalid email or password??!',
                        accessToken: null,
                        statusCode: "401"
                    });
                }
                //signing token with user id
                const token = jwt.sign({
                    id: user.id
                }, process.env.API_SECRET, {
                    expiresIn: 86400
                });
                response.status(200).json({
                    status: 'success',
                    statusCode: "200",
                    message: 'Login Successfully!',
                    accessToken: token,
                    email: email,
                    uuid: uuid
                });
            });
        });
    }, error => {
        response.status(400).json({
            status: 'failed',
            statusCode: "400",
            message: 'Error while login.'
        });
    });
};


module.exports = {
    login,
    getUsers,
    createUser
}