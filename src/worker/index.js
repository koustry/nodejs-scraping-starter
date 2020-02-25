// 'use strict'

const { Worker } = require('worker_threads')


/**
* Use a worker via Worker Threads module to make intensive CPU task
* @param filepath string relative path to the file containing intensive CPU task code
* @return {Promise(mixed)} a promise that contains result from intensive CPU task
*/
async function useWorker(filepath, { index, city, searchUrl, dataUrl }) {
    const data = { index, city, searchUrl, dataUrl }

    return new Promise((resolve, reject) => {
        const worker = new Worker(filepath, { workerData: data })

        worker.on('online', () => { console.log('    Worker for page ' + index + ' is running...') })
        worker.on('message', inserts => {
            resolve(inserts)
        })
        worker.on('error', reject)
        worker.on('exit', code => {
            if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`))
        })
    })
}

module.exports = {
    useWorker
}
