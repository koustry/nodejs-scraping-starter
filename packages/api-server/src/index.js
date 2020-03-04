const dotenv =  require('dotenv')
dotenv.config()

const express = require('express')
const bodyParser = require('body-parser')

const app = express()

const config = require("./config")
const router = require('./router')


async function main() {
    try {
        // await database.initialize()
        app.use(bodyParser.json({ limit: '100mb' }))
        app.use('/api', router)
        app.listen(config.server_port)
        console.log(`App listening on ${config.server_port}`);
    } catch (error) {
        console.error('App crash', error)
        process.exit(1);
    }
} 

main()

module.exports = { app }
