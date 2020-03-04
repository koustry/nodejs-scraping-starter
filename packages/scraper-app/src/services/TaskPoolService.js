"use strict";
const utils = require("../utils")

const Queue = require("../models/Queue")
const taskRunnerService = require("./taskRunnerService")


class TaskPoolService {

    constructor(max) {
        this._max = max || 1
        this._waiting = 0
        this._queue = new Queue()
        this._finished = null
    }

    start(tasks) {
        console.log("=======================> START RUNNER")
        tasks.forEach(task => {
            this._queue.enqueue(task)
        })
        console.log("queue size --> " + this._queue.getLength())
        this._runTasks()
    }

    end() {
        return new Promise(resolve => {
            this._finished = resolve
        })
    }

    async _runTasks() {
        if (this._waiting < this._max && this._queue.getLength()) {
            this._waiting++
            const task = this._queue.dequeue()
            console.log("=======================> RUNNING TASK")
            console.log("queue size --> " + this._queue.getLength())
            console.log("slots --> " + (this._max - this._waiting))
            console.log("task --> " + task.url)
            taskRunnerService.run(task)
                .then(task => {
                    if (task) this._queue.enqueue(...task)
                })
                .catch(task => {
                    if (task) this._queue.enqueue(task)
                })
                .finally(() => {
                    this._waiting--
                    console.log("=======================> FINISHED TASK")
                    console.log("task --> " + task.url)
                    console.log("queue size --> " + this._queue.getLength())
                    console.log("slots --> " + (this._max - this._waiting))
                    if (!this._waiting && !this._queue.getLength()) this._finished()
                    this._runTasks()
                })
            this._runTasks()
        }
    }

}

module.exports = TaskPoolService
