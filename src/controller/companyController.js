const express = require("express")
const router = express.Router()
const httpStatus = require('http-status-codes')

const companyService = require("../service/companyService")


router.get("/", async (req, res, next) => {
    try {
        const results = await companyService.getCompanies(req.query)
        return res.status(httpStatus.OK).send(results)
    } catch (error) {
        console.error(error)
        return res.status(httpStatus.BAD_REQUEST).send({error: error.message})
    }
})

router.get("/:id", async (req, res, next) => {
    try {
        const results = await companyService.getCompany(req.params.id)
        return res.status(httpStatus.OK).send(results)
    } catch (error) {
        console.error(error)
        return res.status(httpStatus.BAD_REQUEST).send({error: error.message})
    }
})


module.exports = router
