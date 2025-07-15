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
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

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

app.use('/' ,require('./routes'))  
// handling error

module.exports = app