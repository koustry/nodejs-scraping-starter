const fs = require('fs')
const util = require('util')
const https = require('https')
const axios = require('axios')
const jsdom = require('jsdom')
const { JSDOM } = jsdom;

const Service = require("../service/companyService")
const Utils = require("../utils")

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
                console.log(`    extracting --> ${company.title} ${company.siren}`)
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
            console.log(`    getting data --> ${company.title} ${company.siren}`)
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

async function scrapDataByCity(searchUrl, dataUrl, city) {
    let companies = []
    let pageCount = 0
    let index = 1
    let delay = 500
    let wait = 10000

    try {
        pageCount = await getPageCount(searchUrl, city)
    } catch (error) {
        console.error(error.message)
        throw error
    }
    for (; index < pageCount; index++) {
        console.log(`=> Processing results on page ${index}/${pageCount}`)
        try {
            await Utils.sleep(delay)
            const names = await getSearchResultsByPage(searchUrl, index, city)
            await Utils.sleep(delay)
            const data = await getDataByCompanies(dataUrl, names)
            const inserts = Utils.filterCompaniesWithData(data)
            await Service.createCompanies(inserts)
            companies = [...companies, ...inserts]
        } catch (error) {
            console.error(error)
            console.log(`=> Retry processing page ${index}/${pageCount}`)
            console.log(`=> Waiting ${wait} before retry...`)
            await sleep(wait)
            wait *= 1.5
            delay *= 1.5
            index -= 1
            continue
        }
    }
    return companies
}

module.exports = {
    loadFromFile,
    scrapDataByCity
}
