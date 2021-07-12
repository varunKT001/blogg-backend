const {pool} = require('../config/dbconfig')
const {register} = require('../controllers/auth')
const express = require('express')
const router = express.Router()

router.post('/register', register)

module.exports = router