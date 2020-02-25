const fs = require('fs')
const util = require('util')
const https = require('https')
const axios = require('axios')
const jsdom = require('jsdom')
const { JSDOM } = jsdom;

const companyService = require("../service/companyService")
const Utils = require("../utils")

const worker = require("../worker/index")

const agent = new https.Agent({ rejectUnauthorized: false })


async function getPageCount(url, city) {
    try {
        const options = { params: { city: city, cityList: 1 }, httpsAgent: agent }
        const response = await axios.get(url, options)
        const dom = new JSDOM(response.data)
        const results = dom.window.document.querySelector('.nb-results-display').textContent
        const pages = Math.ceil(results.match(/[0-9]+/g).reduce((accumulator, currentValue) => accumulator+currentValue) / 10)

        return pages
    } catch (error) {
        console.error(error)
        throw error
    }
}

async function getSearchResultsByPage(url, page, city) {
    try {
        let companyList = []
        const options = { params: { city: city, cityList: 1, page: page }, httpsAgent: agent }
        const response = await axios.get(url, options)
        const dom = new JSDOM(response.data)
        
        dom.window.document
            .querySelectorAll('.result-item')
            .forEach(async (resultItem) => {
                const company = await Utils.extractInfoFromResultItem(resultItem)
                // console.log(`    found company ${company.title} ${company.siren}`)
                companyList.push(company)
            })
        return companyList
    } catch (error) {
        console.error(error.message)
        throw error
    }
}

async function getDataByCompanies(url, companies) {
    try {
        const companyData = companies.map(async (company) => {
            const response = await axios.get(url, { params: { siren: company.siren, webservice: 'dataInfogreffe' }, httpsAgent: agent })
            const data = response.data.chartData.data
            // console.log(`    getting data of ${company.title} ${company.siren}`)
            if (data && Array.isArray(data) && data.length > 0) {
                company.data = {}
                response.data.chartData.data.forEach(year => company.data[year.year] = year)
                return company
            }
            return company
        })
        return await Promise.all(companyData)
    } catch (error) {
        // if request failed, increase sleep time AND retry request one same page 
        console.error(error.message)
        throw error
    }
}

async function loadFromFile(path) {
    const readFile = util.promisify(fs.readFile)
    const data = await readFile(path)

    insertData(JSON.parse(data))
}

async function getPageCountByCity({ searchUrl, city }) {
    try {
        const pageCount = await getPageCount(searchUrl, city)
        console.log("Found " + pageCount + " pages")
        return pageCount
    } catch (error) {
        console.error(error)
        throw error
    }    
}

async function scrapDataByCity(searchUrl, dataUrl, city) {
    let jobs = []
    const pageCount = await getPageCountByCity({ searchUrl, city })

    for (let index = 1 ; index <= pageCount ; index++) {
        const job = () => new Promise(async (resolve, reject) => {
            try {
                console.log(`=> Launching worker for page ${index}/${pageCount}`)
                const inserts = await worker.useWorker("./src/worker/worker.js", { index, city, searchUrl, dataUrl })
                await companyService.createCompanies(inserts)
                resolve()
            } catch (error) {
                console.error(error)
                reject(new Error(`Insert stopped : ${error.message}`))
            }
        })
        jobs.push(job)
    }
    return jobs
}

module.exports = {
    loadFromFile,
    scrapDataByCity,
    getSearchResultsByPage,
    getDataByCompanies
}
