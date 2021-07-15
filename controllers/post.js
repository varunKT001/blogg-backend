const { pool } = require('../config/dbconfig')
const jwt = require('jsonwebtoken')
const marked = require('marked')

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
        contentraw: req.body.content
    }
    try {
        let result = await pool.query(`INSERT INTO blogs (tittle, author, date, edited, content, contentraw) VALUES ($1, $2, $3, $4, $5, $6)`, [blog.tittle, blog.author, blog.date, blog.edited, blog.content, blog.contentraw])
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

module.exports = {
    getBlogs, 
    getUserBlogs,
    postBlog,
    deleteUserBlog
}