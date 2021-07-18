const {pool} = require('../config/dbconfig')
const { register, login, verifyToken, sendEmailLink, verifyUserEmail, sendResetLink, resetPassword } = require('../controllers/auth')
const express = require('express')
const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.get('/verifyToken', verifyToken)
router.post('/verify-email', sendEmailLink)
router.get('/verifyUserEmail/:emailToken', verifyUserEmail)
router.post('/send-reset', sendResetLink)
router.post('/reset-password', resetPassword)


module.exports = router