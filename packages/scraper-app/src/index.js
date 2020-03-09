const dotenv =  require('dotenv')
dotenv.config()

const config = require("./config")
const logger = require("./logger")
const database = require("./database")
const Task = require("./models/Task")
const TaskType = require("./models/TaskType")
const TaskStatus = require("./models/TaskStatus")
const TaskPoolService = require("./services/TaskPoolService")
const companyService = require("./services/companyService")


async function startScraping(department, size) {
    const url = `${config.root_url}/${config.search_path}//${department}/`
    const dueDate = Date.now()
    const type = TaskType.DEPARTMENT
    const status = TaskStatus.TODO
    const task = new Task(url, dueDate, type, status)
    
    try {
        const taskPoolService = new TaskPoolService(size)
        taskPoolService.start(task)
        await taskPoolService.end()
    } catch (error) {
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
        const department = process.argv[2]
        const pool = process.argv[3]
        logger.info('Starting server for department %s with %i', department, pool)
        logger.info('Initializing database')
        await database.initialize()        
        logger.info('Start scraping service')
        await startScraping(process.argv[2], process.argv[3])
        logger.info('Finished scraping')
        const result = await companyService.getCompanies()
        logger.info('Counting %i results in database', result.length)
        process.exit(0)
    } catch (error) {
        logger.error(error)
        process.exit(1)
    }
}

main()
