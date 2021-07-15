const { pool } = require('../config/dbconfig')
const { checkAuthorized } = require('../middleware/checkAuthorization')
const { getBlogs, postBlog, getUserBlogs, deleteUserBlog} = require('../controllers/post')
const express = require('express')
const router = express.Router()

router.get('/blogs', checkAuthorized, getBlogs)
router.get('/blogs/:username', checkAuthorized, getUserBlogs)
router.post('/blog', checkAuthorized, postBlog)
router.delete('/blog/:blogid', checkAuthorized, deleteUserBlog)

module.exports = router