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
            // var p1 = Promise.resolve(3);
            // var p2 = 1337;
            // var p3 = new Promise((resolve, reject) => {
            //     setTimeout(resolve, 5000, 'foo');
            // })
            // console.log([p1, p2, p3]);
            
            // Promise.all([p1, p2, p3]).then(values => { 
            //     console.log(values); // [3, 1337, "foo"] 
            // })

            console.log("=> Loading data by scraping")
            // console.log("AAA")
            const jobs = await scrapingService.scrapDataByCity(SEARCH_URL, DATA_URL, CITY)
            // console.log("BBB")
            // console.log(jobs)
            // console.log("CCC")
            const size = 30
            for (let i = 0; i < jobs.length; i+=size) {
                
                const jobsToRun = jobs.slice(i, size+i)
                let prom = []
                console.log("=> Start running " + (size+i) + " workers of " + jobs.length)
                for (const job of jobsToRun) {
                    prom.push(job())
                }
                try {
                    await Promise.all(prom)
                    console.log("=> Finish running " + (size+i) + " workers of " + jobs.length)
                } catch (error) {
                    throw error
                }
                await utils.sleep(5000)
                if (i % 100 === 0) await utils.sleep(15000)
                prom = []
            }

            // NEED TO SPLIT JOBS IN ARRAY OF ≈ 10 TASKS 
            // await Promise.all(jobs)
            // console.log("DDD")
            // utils.sleep(2000)
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
