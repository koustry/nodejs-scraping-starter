const dotenv =  require('dotenv')
dotenv.config()
const util = require('util')
const fs = require('fs')

const database = require("./database")
const TaskPoolService = require("./services/TaskPoolService")
const taskRunnerService = require("./services/taskRunnerService")
const companyService = require("./services/companyService")


async function startScraping(department, size) {
    try {
        const task = await taskRunnerService.initialize(department)
        const taskPoolService = new TaskPoolService(size)

        // TODO: clean logs + count task / total urls 
        taskPoolService.start(task)
        await taskPoolService.end()
    } catch (error) {
        console.error(error)
        throw error
    }
}

function checkArgs() {
    if (process.argv.length === 3 && (process.argv[2] === "-h" || process.argv[2] === "--help"))
        printHelp()
    if (process.argv.length > 3 && process.argv.length < 5)
        return true
    return false
}

function printHelp() {
    console.log("Usage:");
    console.log("  yarn run scraper-app [department] [concurency]");
    console.log("");
    console.log("Description:");
    console.log("  department \t the department name");
    console.log("  concurrency \t the queue size");
    console.log("");
    process.exit(0)
}

async function main() {
    try {        
        if (!checkArgs()) 
            throw new Error("Bad arguments")
        if (process.argv[2] === "-h" || process.argv[2] === "--help")
            printHelp()
        console.log("=> Init database")
        await database.initialize()
        console.log("=> Start scraping")
        await startScraping(process.argv[2], process.argv[3])
        console.log("=> Finished scraping")
        console.log("=> Counting results")
        const result = await companyService.getCompanies()
        console.log(util.inspect(result.length, false, null, true))
        process.exit(0)
    } catch (error) {
        console.error(`App crashed`)
        console.error(error)
        process.exit(1)
    }
}

main()
