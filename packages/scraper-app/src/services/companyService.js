const Company = require('../entities/Company')


async function getCompanies(params) {
    try {
        const res = await Company.find({})
        return res
    } catch (error) {
        console.error(error.message)
        throw error
    }
}

async function getCompany(id) {
    try {
        const res = await Company.findOne({ _id: id })
        return res
    } catch (error) {
        console.error(error.message)
        throw error
    }
}

async function saveCompanies(companies) {    
    for (const company of companies) {
        try {
            const comp = new Company(company)
            const res = await comp.save()
            console.log(`inserting company ${res.title} ${res.siren}`)
        } catch (error) {
            console.error(error.message)
        }        
    }
}

async function saveData(data, url) {
    const siren = url.match(/[0-9]+/g)[0]

    try {
        const company = await Company.findOne({ siren: siren })
        company.data = data
        const comp = new Company(company)
        await comp.save()
    } catch (error) {
        console.error(error.message)
    }
}

module.exports = {
    getCompanies,
    getCompany,
    saveCompanies,
    saveData
}
