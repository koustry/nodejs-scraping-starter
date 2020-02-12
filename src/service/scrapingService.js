const fs = require('fs')
const util = require('util')
const axios = require('axios')
const jsdom = require("jsdom")
const { JSDOM } = jsdom;

const Company = require('../model/companyModel')


async function getPageCount(url, city) {
    try {
        const options = { params: { city: city, cityList: 1 } }
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
        const options = { params: { city: city, cityList: 1, page: page } }
        const response = await axios.get(url, options)
        const dom = new JSDOM(response.data)

        dom.window.document
            .querySelectorAll('.result-item')
            .forEach(async (resultItem) => {
                const company = await extractInfoFromResultItem(resultItem)
                companyList.push(company)
            })
        return companyList
    } catch (error) {
        console.error(error.message)
        throw error
    }
}

async function extractInfoFromResultItem(resultItem) {
    let company = {}
    
    try {
        const words = resultItem.querySelector(".result-item-title").textContent.match(/[a-zA-Z]+/g)
        const siret = resultItem.querySelector(".result-item-siren").textContent.replace(/\s+/g, "").split(':')[1]
        
        company.title = words.reduce((accumulator, currentValue) => accumulator + '-' + currentValue)
        company.siret = Number(siret)
        company.siren = Number(siret.substr(0, 9))
        company.ape = resultItem.querySelector(".result-item-ape").textContent.match(/\d+[A-Z]/g)[0]
        company.activity = resultItem.querySelector(".result-item-ape").textContent.match(/.*-\s(.*)/)[1]
        company.address = resultItem.querySelector(".result-item-address").textContent.replace(/(\t)/g, '').replace(/(\n)/g, '').replace('  ', ' ').replace(/[ ]$/g, '')
        return company
    } catch (error) {
        console.error(error.message)
        throw error
    }
}

async function getDataByCompanies(url, companies) {
    try {
        const companyData = companies.map(async (company) => {
            const response = await axios.get(url, { params: { siren: company.siren, webservice: 'dataInfogreffe' } })
            const data = response.data.chartData.data

            if (data && Array.isArray(data) && data.length > 0) {
                company.data = {}
                response.data.chartData.data.forEach(year => company.data[year.year] = year)
                return company
            }
            return company
        })
        return await Promise.all(companyData)
    } catch (error) {
        console.error(error.message)
        throw error
    }
}

async function extract(searchUrl, dataUrl, city) {
    try {
        const pageCount = await getPageCount(searchUrl, '31000 - TOULOUSE')
        let companies = []

        for (let i = 1; i <= pageCount; i++) {
            const names = await getSearchResultsByPage(searchUrl, i, city)
            const data = await getDataByCompanies(dataUrl, names)
            console.log(`Getting results on page ${i}/${pageCount}`)
            companies = [...companies, ...data]
        }        
        return companies
    } catch (error) {
        console.error(error.message)
        throw error
    }
}

function transform(companies) {
    return companies.filter((company) => {
        if (company.data) return company
    })
}

async function insertData(companies) {
    for (const company of companies) {
        try {
            const comp = new Company(company)
            const res = await comp.save()
            console.log(`\t inserting --> ${res.title} ${res.siren}`)
        } catch (error) {
            console.error(error.message)
        }        
    }
}

async function loadFromFile(path) {
    const readFile = util.promisify(fs.readFile)
    const data = await readFile(path)

    insertData(JSON.parse(data))
}

async function loadFromScraping(searchUrl, dataUrl, city) {
    let companies = []

    try {
        const pageCount = await getPageCount(searchUrl, city)

        for (let i = 558; i <= pageCount; i++) {
            await sleep(2000)
            console.log(`=> Processing results on page ${i}/${pageCount}`)
            const names = await getSearchResultsByPage(searchUrl, i, city)
            const data = await getDataByCompanies(dataUrl, names)
            const inserts = transform(data)
            await insertData(inserts)
            companies = [...companies, ...inserts]
        }
        return companies
    } catch (error) {
        console.error(error.message)
        throw error
    }

}

function sleep(delay) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve()
        }, delay);
    })
}

module.exports = {
    loadFromFile,
    loadFromScraping
}
