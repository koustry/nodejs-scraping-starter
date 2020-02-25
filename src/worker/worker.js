// 'use strict'

const { parentPort, workerData } = require('worker_threads')

const scrapingService = require("../service/scrapingService")
const utils = require("../utils")


async function scrapDataByPage() {
    try {
        console.log(`    Scraping companies on page ${workerData.index}...`)
        const names = await scrapingService.getSearchResultsByPage(workerData.searchUrl, workerData.index, workerData.city)
        const data = await scrapingService.getDataByCompanies(workerData.dataUrl, names)
        const inserts = utils.filterCompaniesWithData(data)
        console.log(`    Got ${inserts.length}/${names.length} companies with data for insert`)
        console.log(`    Worker for page ${workerData.index} has finished !`)
        parentPort.postMessage(inserts)
    } catch (error) {
        console.error(error.message)
        // throw error
    }
}

async function main() {
    await scrapDataByPage()
}

main()
