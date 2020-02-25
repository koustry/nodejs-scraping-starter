const fs = require('fs')
const dotenv =  require('dotenv')
dotenv.config()
const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const config = require('./config')
const router = require('./router')
const database = require('./database')
const scrapingService = require('./service/scrapingService')
const utils = require("./utils")


const CITY = '75000 - PARIS'
const SEARCH_URL = 'https://www.pple.fr/recherche//'
const DATA_URL = 'https://www.pple.fr/webservices'
const PATH = 'data/data'


async function initData() {    
    if (fs.existsSync(PATH)) {
        try {
            console.log("Loading data from file")
            // await scrapingService.loadFromFile(PATH)
        } catch (error) {
            console.error(error)
            throw error
        }
    } else {
        try {
            console.log("=> Loading data by scraping")
            const jobs = await scrapingService.scrapDataByCity(SEARCH_URL, DATA_URL, CITY)
            const workerPool = 20

            for (let i = 0 ; i < jobs.length ; i += workerPool) {
                let jobsToRun = []
                const workers = jobs.slice(i, workerPool + i)
                for (const job of workers) {
                    jobsToRun.push(job())
                }
                try {
                    await Promise.all(jobsToRun)
                } catch (error) {
                    console.error(error)
                }
                await utils.sleep(10000)
                jobsToRun = []
            }
            // console.log("Saving data in file")
            // fs.writeFileSync(PATH, JSON.stringify(companies))
        } catch (error) {
            console.error(error)
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
