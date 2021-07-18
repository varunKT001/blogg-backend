const { pool } = require('../config/dbconfig')
const { checkAuthorized } = require('../middleware/checkAuthorization')
const { getBlogs, postBlog, getUserBlogs, deleteUserBlog, likePost, likedOrNot, getBlog} = require('../controllers/post')
const express = require('express')
const router = express.Router()

router.get('/blogs', checkAuthorized, getBlogs)
router.get('/blog/blogid/:blogid', getBlog)
router.get('/blogs/:username', checkAuthorized, getUserBlogs)
router.post('/blog', checkAuthorized, postBlog)
router.delete('/blog/:blogid', checkAuthorized, deleteUserBlog)
router.post('/blog/like', checkAuthorized, likePost)
router.get('/blog/likedOrNot', likedOrNot)

module.exports = router