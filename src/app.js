require('dotenv').config()
const compression = require('compression')
const express = require('express')
const { default: helmet } = require('helmet')
const morgan = require('morgan')
const app = express()

// init middlewares

app.use(morgan("dev"))
app.use(helmet())
app.use(compression())  

// app.use(morgan("combined"))
// morgan("common")
// morgan("short")
// morgan("tiny")
// morgan("dev")

// init db

// require('./dbs/init.mongodb.lv0')
require('./dbs/init.mongodb')
const { checkOverLoad } = require('./helpers/check.connect')
checkOverLoad()

// init routes 
app.get('/', (req, res, next) => {
    const strCompress = 'Hello compress'

    return res.status(200).json({
        message: 'Welcome Fantipjs',
        metadata: strCompress.repeat(10000)
    })
})

// handling error

module.exports = app