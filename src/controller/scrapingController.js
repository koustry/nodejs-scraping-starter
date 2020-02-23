const express = require("express")
const router = express.Router()
const httpStatus = require('http-status-codes')

const companyService = require("../service/scrapingService")


router.post("/", async (req, res, next) => {
    try {
        // should get a city input,
        // then create a new job and add it to a redis tasks queue
        // scraping service should wait for new tasks in redis for process it
        // when the task is finish, the job status is updated
        // response is a job id / status 
        console.log("START SCRAPING")
        res.status(httpStatus.OK).send("OK")
    } catch (error) {
        console.error(error)
        return res.status(httpStatus.BAD_REQUEST).send({error: error.message})
    }
})


module.exports = router
