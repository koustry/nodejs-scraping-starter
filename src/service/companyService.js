const Company = require('../model/companyModel')


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

async function createCompanies(companies) {    
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

module.exports = {
    getCompanies,
    getCompany,
    createCompanies
}
