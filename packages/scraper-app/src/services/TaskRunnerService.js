const utils = require("../utils")
const config = require("../config")
const logger = require("../logger")

const Task = require("../models/Task")
const TaskType = require("../models/TaskType")
const TaskStatus = require("../models/TaskStatus")
const scrapingService = require("./scrapingService")


class TaskRunnerService {

    constructor(wait) {
        this._wait = wait | 5000
        this._delay = 60000
    }

    run(task) {
        return new Promise(async (resolve, reject) => {
            if (Date.now() < task.dueDate)
                return reject(task)
            try {
                await utils.sleep(this._wait)
                const result = await scrapingService.exec({ url: task.url, taskType: task.type })
                const tasks = this._generateNextTasks({ taskType: task.type, url: task.url, data: result })
                resolve(tasks)
            } catch (error) {
                if (error.response && Math.round(error.response.status / 100) === 5) {
                    logger.error("Error response with status %i, requeuing task", error.response.status)
                    logger.error("Reporting task to %s", date.toString())
                    task.dueDate = new Date(Date.now() + (this._delay * 5))
                    return reject(task)
                }
                logger.error("Error %s, removing task from queue", error.message)
                reject()
            }
        })
    
    }

    _generateNextTasks({ taskType, url, data }) {
        let next = null

        if (data) {        
            switch (taskType) {
                case TaskType.DEPARTMENT:
                    next = this._generateCompanyTasks(data, url)
                    break
                case TaskType.COMPANY:
                    next = this._generateDataTasks(data)
                    break
                default:
                    break
            }
        }
        return next
    }

    _generateCompanyTasks(pages, url) {
        let tasks = []

        if (pages && url) {
            const arr = url.split('/')
            const department = arr[arr.length - 2]
            
            for (let i = 1 ; i <= pages ; i++) {
                const url = `${config.root_url}/${config.search_path}//${department}/?&page=${i}`
                const dueDate = Date.now()
                const type = TaskType.COMPANY
                const status = TaskStatus.TODO
                const task = new Task(url, dueDate, type, status)
                tasks = [...tasks, task]        
            }
        }
        return tasks
    }

    _generateDataTasks(companies) {
        let tasks = []

        if (companies && companies.length) {
            companies.forEach(company => {
                const url = `${config.root_url}/${config.data_path}?siren=${company.siren}&webservice=dataInfogreffe`
                const dueDate = Date.now()
                const type = TaskType.DATA
                const status = TaskStatus.TODO
                const task = new Task(url, dueDate, type, status)
                tasks = [...tasks, task]
            })
        }
        return tasks
    }

}

module.exports = TaskRunnerService
