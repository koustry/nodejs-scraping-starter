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

module.exports = {
    getCompanies
}
