const {pool} = require('../config/dbconfig')
const bcrpt = require('bcrypt')
const salt = 10

async function register(req, res){
    console.log('Register request recieved', req.body)
    const userData = {
        name: req.body.name,
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    }
    /*------ CHECK IF THE USER EXIST OR NOT ------*/
    try {
        let result = await pool.query(`SELECT username, email FROM users WHERE username = $1`, [userData.username])
        if(result.rows.length === 1){
            if(result.rows[0].email == userData.email){
                return res.json({
                    message: 'user already registered'
                })
            }
            else{
                return res.json({
                    message: 'username already exist'
                })
            }
        }
        else{
            bcrpt.hash(userData.password, salt, async (err, hashPassword)=>{
                if(err){
                    console.log(err)
                    return res.json({
                        message: 'internal server error'
                    })
                }
                else{
                    try {
                        let result_1 = await pool.query(`INSERT INTO users (name, username, email, password) VALUES ($1, $2, $3, $4)`, [userData.name, userData.username, userData.email, hashPassword])
                        return res.json({
                            message: 'user successfully registered'
                        })
                    } catch (err) {
                        console.log(err)
                        return res.json({
                            message: 'internal server error'
                        })
                    }
                }
            })
        }
    } catch (err) {
        console.log(err)
        return res.json({
            message: 'internal server error'
        })
    }
}

module.exports = {
    register
}