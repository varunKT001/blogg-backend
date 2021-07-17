const { pool } = require('../config/dbconfig')
const jwt = require('jsonwebtoken')
const marked = require('marked')
const { post } = require('../routes/post')

async function getBlogs(req, res){
    console.log('fetch blogs request recieved')
    try {
        let result = await pool.query(`SELECT * FROM blogs ORDER BY blogid DESC`)
        let blogs = result.rows
        return res.json({
            message: 'blogs fetched successfully',
            blogs
        })
    } catch (err) {
        console.log(err)
        return res.json({
            message: 'internal server error',
            errcode: '#101'
        })
    }
}

async function getUserBlogs(req, res){
    console.log('fetch user blogs request recieved')
    try {
        let result = await pool.query(`SELECT * FROM blogs WHERE author = $1 ORDER BY blogid DESC`, [req.params.username])
        let blogs = result.rows
        return res.json({
            message: 'blogs fetched successfully',
            blogs
        })
    } catch (err) {
        console.log(err)
        return res.json({
            message: 'internal server error',
            errcode: '#101'
        })
    }
}

async function postBlog(req, res){
    console.log('post blog request recieved')
    blog = {
        tittle: req.body.tittle,
        author: req.body.author,
        date: req.body.date,
        edited: req.body.edited,
        content: marked(req.body.content),
        description: req.body.description,
        contentraw: req.body.content
    }
    try {
        let result = await pool.query(`INSERT INTO blogs (tittle, author, date, edited, content, contentraw, description, likes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, [blog.tittle, blog.author, blog.date, blog.edited, blog.content, blog.contentraw, blog.description, 0])
        return res.json({
            message: 'blog posted successfully'
        })
    } catch (err) {
        console.log(err)
        return res.json({
            message: 'internal server error',
            errcode: '#102'
        })
    }
}

async function deleteUserBlog(req, res){
    console.log('delete user blog request recieved', req.params.blogid)
    blogid = req.params.blogid
    try {
        let result = await pool.query(`DELETE FROM blogs WHERE blogid = $1`, [blogid])
        let result_1 = await pool.query(`DELETE FROM likes WHERE blogid = $1`, [blogid])
        return res.json({
            message: 'blog deleted successfully'
        })
    } catch (err) {
        console.log(err)
        return res.json({
            message: 'internal server error',
            errcode: '#104'
        })
    }
}

async function likePost(req, res){
    let userid = req.body.userid
    let blogid = req.body.blogid
    console.log('like request recieved', userid, blogid)
    try {
        let result = await pool.query(`SELECT * FROM likes WHERE userid = $1 AND blogid = $2`, [userid, blogid])
        if(result.rows.length == 0){
            try {
                let result_1 = await pool.query(`INSERT INTO likes (userid, blogid) VALUES ($1, $2)`, [userid, blogid])
                let updateLikes = await pool.query(`UPDATE blogs SET likes = likes + 1 WHERE blogid = $1`, [blogid])
                return res.json({
                    message: 'liked'
                })
            } catch (err) {
                console.log(err)
                return res.json({
                    message: 'internal server error',
                    errcode: '#102'
                })
            }
        }
        else{
            try {
                let result_2 = await pool.query(`DELETE FROM likes WHERE userid = $1 AND blogid = $2`, [userid, blogid])
                let updateLikes = await pool.query(`UPDATE blogs SET likes = likes - 1 WHERE blogid = $1`, [blogid])
                return res.json({
                    message: 'undo liked'
                })
            } catch (err) {
                console.log(err)
                return res.json({
                    message: 'internal server error',
                    errcode: '#103'
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

async function likedOrNot(req, res){
    let userid = req.query.userid
    let blogid = req.query.blogid
    console.log('likedOrNot request recieved', userid, blogid)
    try {
        let result = await pool.query(`SELECT * FROM likes WHERE userid = $1 AND blogid = $2`, [userid, blogid])
        if (result.rows.length == 0){
            return res.json({
                message: false
            })
        }
        else{
            return res.json({
                message: true
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

module.exports = {
    getBlogs, 
    getUserBlogs,
    postBlog,
    deleteUserBlog,
    likePost,
    likedOrNot
}