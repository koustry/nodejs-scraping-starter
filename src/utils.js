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

function sleep(delay) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve()
        }, delay);
    })
}

function filterCompaniesWithData(companies) {
    return companies.filter((company) => {
        if (company.data) return company
    })
}


module.exports = {
    extractInfoFromResultItem,
    sleep,
    filterCompaniesWithData
}
