const express = require("express")
const router = express.Router()
const httpStatus = require('http-status-codes')

let i = 0;

router.get("/", async (req, res, next) => {
    console.log("Request %i => " + req.headers["user-agent"], ++i);
    try {
        // console.log(req.get('User-Agent'))
        return res.status(httpStatus.GATEWAY_TIMEOUT).send({ headers: req.headers })
    } catch (error) {
        console.error(error)
        return res.status(httpStatus.BAD_REQUEST).send({error: error.message})
    }
})

module.exports = router
