const config = require("../config")
const utils = require("../utils")

const Task = require("../models/Task")
const TaskType = require("../models/TaskType")
const TaskStatus = require("../models/TaskStatus")
const scrapingService = require("./scrapingService")


// TODO : refactor module in Class

async function initialize() {
    try {
        const departments = await scrapingService.getDepartments()
        let tasks = []
    
        departments.forEach(department => {
            const url = `${config.root_url}/${config.search_path}//${department}/`
            const dueDate = Date.now()
            const type = TaskType.DEPARTMENT
            const status = TaskStatus.TODO
            const task = new Task(url, dueDate, type, status)
            tasks = [...tasks, task]
        })
        return tasks
    } catch (error) {
        throw error
    }
}

async function run(task) {
    await utils.sleep(2000)
    return new Promise(async (resolve, reject) => {
        if (Date.now() < task.dueDate || task.status !== TaskStatus.TODO) {
            reject(task)
            return
        }
        try {
            const result = await scrapingService.exec({ url: task.url, taskType: task.type })
            const tasks = _generateNextTasks({ taskType: task.type, url: task.url, data: result })
            resolve(tasks)
        } catch (error) {
            if (error.response && Math.round(error.response.status / 100) === 5) {
                console.error("Error response with status %i, requeuing task", error.response.status)
                const date = new Date(Date.now() + (60000 * 5))
                console.error("reporting task to", date.toString())
                task.dueDate = date
                reject(task)
                return
            }
            console.error("Error unknown, deleting task from queue")
            console.error(error.message)
            reject()
        }
    })
}

function _generateNextTasks({ taskType, url, data }) {
    let next = null

    if (data) {        
        switch (taskType) {
            case TaskType.DEPARTMENT:
                next = _generateCompanyTasks(data, url)
                break
            case TaskType.COMPANY:
                next = _generateDataTasks(data)
                break
            default:
                break
        }
    }
    return next
}

function _generateCompanyTasks(pages, url) {
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

function _generateDataTasks(companies) {
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

module.exports = {
    initialize,
    run
}
