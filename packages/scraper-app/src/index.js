const dotenv =  require('dotenv')
dotenv.config()
const util = require('util')

const database = require("./database")
const TaskPoolService = require("./services/TaskPoolService")
const taskRunnerService = require("./services/taskRunnerService")
const companyService = require("./services/companyService")

async function startScraping() {
    try {
        console.log("=======================> INIT TASKS")
        const tasks = await taskRunnerService.initialize()
        console.log("total --> " + tasks.length)
        const taskPoolService = new TaskPoolService(50)

        taskPoolService.start(tasks.splice(0, 1))
        await taskPoolService.end()
        console.log("=======================> END RUNNER")
    } catch (error) {
        console.error(error)
        throw error
    }
}

async function main() {
    try {
        console.log("=> Init database")
        await database.initialize()
        console.log("=> Start scraping")
        await startScraping()
        console.log("=> Finished scraping")
        const result = await companyService.getCompanies()
        console.log("=> Showing results")
        console.log(util.inspect(result, false, null, true))
        process.exit(0)
    } catch (error) {
        console.error(`App crashed`)
        console.error(error)
        process.exit(1)
    }
}

main()
