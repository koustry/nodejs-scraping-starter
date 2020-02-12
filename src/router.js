const express = require('express')
const router = express.Router()

const companyController = require('./controller/companyController')


router.use(express.json())
router.use('/companies', companyController)

module.exports = router
