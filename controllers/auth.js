const { pool } = require('../config/dbconfig')
const bcrpt = require('bcrypt')
const jwt = require('jsonwebtoken')
const salt = 10

async function register(req, res) {
    console.log('Register request recieved', req.body)
    const userData = {
        name: req.body.name,
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    }
    try {
        /*------ REGISTER USER ------*/
        let result = await pool.query(`SELECT username, email FROM users WHERE username = $1 OR email = $2`, [userData.username, userData.email])
        if (result.rows.length === 0) {
            bcrpt.hash(userData.password, salt, async (err, hashPassword) => {
                if (err) {
                    console.log(err)
                    return res.json({
                        message: 'internal server error',
                        errcode: '#201'
                    })
                }
                else {
                    try {
                        let result_1 = await pool.query(`INSERT INTO users (name, username, email, password, verified) VALUES ($1, $2, $3, $4, $5)`, [userData.name, userData.username, userData.email, hashPassword, 'false'])
                        return res.json({
                            message: 'user successfully registered'
                        })
                    } catch (err) {
                        console.log(err)
                        return res.json({
                            message: 'internal server error',
                            errcode: '#102'
                        })
                    }
                }
            })
        }
        /*------ CHECK IF THE USER EXIST OR NOT ------*/
        else {
            if (result.rows[0].email == userData.email) {
                return res.json({
                    message: 'user already registered'
                })
            }
            else {
                return res.json({
                    message: 'username already exist'
                })
            }
        }
    } catch (err) {
        console.log(err)
        return res.json({
            message: 'internal server error',
            errcode: '#101'
        })
    }
}

async function login(req, res) {
    userData = {
        email: req.body.email,
        password: req.body.password
    }
    console.log('login request recieved', userData)
    try {
        let result = await pool.query(`SELECT * FROM users WHERE email = $1`, [userData.email])
        if (result.rows.length === 1) {
            bcrpt.compare(userData.password, result.rows[0].password, async (err, match) => {
                if (err) {
                    console.log(err)
                    return res.json({
                        message: 'internal sever error',
                        errcode: '#202'
                    })
                }
                else {
                    if (match) {
                        const user = {
                            name: result.rows[0].name,
                            username: result.rows[0].username,
                            email: result.rows[0].email,
                            verified: result.rows[0].verified
                        }
                        jwt.sign({
                            name: user.name,
                            username: user.username,
                            email: user.email
                        }, process.env.SECRET_KEY, { expiresIn: '60m' }, (err, token) => {
                            if (err) {
                                console.log(err)
                                return res.json({
                                    message: 'internal server error',
                                    errcode: '#301'
                                })
                            }
                            else {
                                return res.json({
                                    message: 'user logged in successfully',
                                    token: token
                                })
                            }
                        })
                    }
                    else {
                        return res.json({
                            message: 'password incorrect'
                        })
                    }
                }
            })
        }
        else if (result.rows.length === 0) {
            return res.json({
                message: 'user not found'
            })
        }
    } catch (err) {
        console.log(err)
        return res.json({
            message: 'internal server error',
            errcode: '#101'
        })
    }

}

async function verifyToken(req, res) {
    token = req.headers.authorization.split(' ')[1]
    jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
        if (err) {
            console.log(err)
            if (err.name == 'TokenExpiredError') {
                return res.json({
                    message: 'token expired'
                })
            }
            else if (err.name == 'JsonWebTokenError' && err.message == 'jwt malformed') {
                return res.json({
                    message: 'jwt malformed'
                })
            }
            else if (err.name == 'JsonWebTokenError' && err.message == 'invalid token') {
                return res.json({
                    message: 'invalid token'
                })
            }
        }
        else {
            return res.json({
                message: 'verified',
                user
            })
        }
    })

}

module.exports = {
    register,
    login,
    verifyToken
}