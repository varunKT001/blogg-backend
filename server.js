require('dotenv').config()

const PORT = process.env.PORT || 5000
const express = require('express')
const app = express()
const auth = require('./routes/auth')

app.use(express.json())

app.use('/auth', auth)

app.listen(PORT, ()=>{
    console.log(`Listening on port ${PORT}`)
})