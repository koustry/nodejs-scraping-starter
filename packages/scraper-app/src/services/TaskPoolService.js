const utils = require("../utils")
const logger = require("../logger")
const Queue = require("../models/Queue")
const TaskRunnerService = require("./TaskRunnerService")


class TaskPoolService {

    constructor(max) {
        this._max = max || 1
        this._waiting = 0
        this._queue = new Queue()
        this._finished = null
        this._taskRunner = new TaskRunnerService(3000)
    }

    start(task) {
        logger.info("Start runner 🚀")
        this._queue.enqueue(task)
        logger.info("Queue size %i", this._queue.getLength())
        logger.info("Slots %i", (this._max - this._waiting))
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
            this._taskRunner.run(task)
                .then(res => {
                    if (res)
                        this._queue.enqueue(...res)
                })
                .catch(res => {
                    if (res)
                        this._queue.enqueue(res)
                })
                .finally(() => {
                    this._waiting--
                    logger.info("✅ Task %s finished", task.url)
                    logger.info("Queue size %i - slots %i", this._queue.getLength(), (this._max - this._waiting))
                    if (!this._waiting && !this._queue.getLength())
                        this._finished()
                    this._execTask()
                })
            this._execTask()
        }
    }

}

module.exports = TaskPoolService
