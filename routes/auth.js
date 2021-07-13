const {pool} = require('../config/dbconfig')
const {register, login, verifyToken} = require('../controllers/auth')
const express = require('express')
const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.get('/verifyToken', verifyToken)

module.exports = router