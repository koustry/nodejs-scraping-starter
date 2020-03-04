const fs = require('fs')
const path = require('path')
const https = require('https')
const axios = require('axios')
const jsdom = require('jsdom')
const { JSDOM } = jsdom

const TaskType = require("../models/TaskType")
const companyService = require("./companyService")


const agent = new https.Agent({ rejectUnauthorized: false })
const headers = { 
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/82.0.4074.0 Safari/537.36'
}
const options = { httpsAgent: agent, headers: headers }


async function exec({ url, taskType }) {
    try {
        switch (taskType) {
            case TaskType.DEPARTMENT:
                return await _getPageCount(url)
            case TaskType.COMPANY:
                const companies = await _getCompaniesInfo(url)
                await companyService.saveCompanies(companies)
                return companies
            case TaskType.DATA:
                const data = await _getCompanyData(url)
                await companyService.saveData(data, url)
                return data
        }            
    } catch (error) {
        throw error
    }
}

async function getDepartments() {
    try {
        const filePath = path.join(__dirname, "../../../../", "data/", "departments.json")
        const content = await fs.readFileSync(filePath)
        const departments = JSON.parse(content)

        return departments
    } catch (error) {
        throw error
    }
}

async function _getPageCount(url) {
    const resultsByPage = 10

    try {
        const response = await axios.get(url, options)
        const dom = new JSDOM(response.data)
        const results = dom.window.document.querySelector('.nb-results-display').textContent
        const count = results.match(/[0-9]+/g).reduce((accumulator, currentValue) => accumulator + currentValue)
        const pageCount = Math.ceil(count / resultsByPage)

        return pageCount
    } catch (error) {
        throw error
    }
}

async function _getCompaniesInfo(url) {
    let companies = []

    try {
        console.log("scraping url --> " + url)
        const response = await axios.get(url, options)
        const dom = new JSDOM(response.data)
        const items = dom.window.document.querySelectorAll('.result-item')

        items.forEach(async (resultItem) => companies.push(_extractCompanyInfo(resultItem, url)))
        return companies
    } catch (error) {
        console.log(error)
        throw error
    }
}

async function _getCompanyData(url) {
    let companyData = []
    try {
        const response = await axios.get(url, options)
        const data = response.data.chartData.data
        if (data && Array.isArray(data) && data.length) {
            data.forEach(elem => {
                const { year, ca, results, effectif, ratioCaResults } = elem
                const ratio = Number(ratioCaResults)
                companyData.push({ year, ca, results, effectif, ratioCaResults: ratio })
            })
        }
        return companyData
    } catch (error) {
        throw error
    }
}

// TODO : refactor this func
function _extractCompanyInfo(item, url) {
    let company = {
        title: '',
        siret: null,
        siren: null,
        ape: '',
        activity: '',
        address: ''
    }

    try {
        // console.log("extracting url --> " + url);
        const words = item.querySelector(".result-item-title").textContent.match(/[a-zA-Z]+/g)
        // console.log("words", words);
        
        const siret = item.querySelector(".result-item-siren").textContent.replace(/\s+/g, "").split(':')[1]

        company.title = words.reduce((accumulator, currentValue) => accumulator + ' ' + currentValue)
        // console.log("company.title", company.title);
        company.siret = Number(siret)
        company.siren = Number(siret.substr(0, 9))
        company.ape = item.querySelector(".result-item-ape").textContent.match(/\d+[A-Z]/g)[0]
        company.activity = item.querySelector(".result-item-ape").textContent.match(/.*-\s(.*)/)[1]
        company.address = item.querySelector(".result-item-address").textContent.replace(/(\t)/g, '').replace(/(\n)/g, '').replace('  ', ' ').replace(/[ ]$/g, '')
        return company
    } catch (error) {
        throw error
    }
}

module.exports = {
    exec,
    getDepartments
}
