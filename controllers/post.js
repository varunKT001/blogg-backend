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

module.exports = {
    getBlogs, 
    postBlog
}