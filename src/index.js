const fs = require('fs')
const dotenv =  require('dotenv')
dotenv.config();

const express = require('express')
const bodyParser = require('body-parser')

const config = require('./config')
const router = require('./router')
const database = require('./database')
const scrapingService = require('./service/scrapingService')

const app = express()


const CITY = '31000 - TOULOUSE'
const SEARCH_URL = 'https://www.pple.fr/recherche//'
const DATA_URL = 'https://www.pple.fr/webservices'
const PATH = 'data/data'


async function initData() {
    if (fs.existsSync(PATH)) {
        try {
            console.log("Loading data from file")
            await scrapingService.loadFromFile(PATH)
        } catch (error) {
            console.error(error.message)
            throw error
        }
    } else {
        try {
            console.log("Loading data by scraping")
            const companies = await scrapingService.loadFromScraping(SEARCH_URL, DATA_URL, CITY)
            console.log("Saving data in file")
            fs.writeFileSync(PATH, JSON.stringify(companies))            
        } catch (error) {
            console.error(error.message)
        }
    }
}

async function main() {
    try {
        await database.initialize()
        await initData()
        app.use(bodyParser.json({ limit: '100mb' }))
        app.use('/api', router)
        app.listen(config.port)
        console.log(`App listening on ${config.port}`);
    } catch (error) {
        console.error('App crash', error)
        process.exit(1);
    }
} 

main()

module.exports = { app }
