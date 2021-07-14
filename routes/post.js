const { pool } = require('../config/dbconfig')
const { checkAuthorized } = require('../middleware/checkAuthorization')
const { getBlogs, postBlog } = require('../controllers/post')
const express = require('express')
const router = express.Router()

router.get('/blogs', checkAuthorized, getBlogs)
router.post('/blog', checkAuthorized, postBlog)

module.exports = router