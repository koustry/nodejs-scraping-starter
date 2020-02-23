const express = require('express')
const router = express.Router()

const companyController = require('./controller/companyController')
const scrapingController = require('./controller/scrapingController')


router.use(express.json())
router.use('/companies', companyController)
router.use('/scraping', scrapingController)

module.exports = router
