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

    start(task) {
        console.log("\t 🚀 START RUNNER")
        this._queue.enqueue(task)
        console.log("\t --> queue: " + this._queue.getLength())
        console.log("\t --> slots: " + (this._max - this._waiting))
        this._execTask()
    }

    end() {
        return new Promise(resolve => {
            this._finished = resolve
        })
    }

    async _execTask() {
        await utils.sleep(3000)
        if (this._waiting < this._max && this._queue.getLength()) {
            this._waiting++
            const task = this._queue.dequeue()
            taskRunnerService.run(task)
                .then(res => {
                    if (res) this._queue.enqueue(...res)
                    console.log("\t ✅ Task finished")
                })
                .catch(res => {
                    if (res) this._queue.enqueue(res)
                    console.log("\t ❌ Task failed")
                })
                .finally(() => {
                    this._waiting--
                    console.log("\t --> url: " + task.url)
                    console.log("\t --> queue: " + this._queue.getLength())
                    console.log("\t --> slots: " + (this._max - this._waiting))
                    if (!this._waiting && !this._queue.getLength())
                        this._finished()
                    this._execTask()
                })
            this._execTask()
        }
    }

}

module.exports = TaskPoolService
