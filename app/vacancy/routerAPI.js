var express = require('express');
var router = express.Router();
const { getVacancy, getVacancyById } = require('./controller')

/* GET home page. */
router.get('/', getVacancy);
router.get('/:id', getVacancyById);


module.exports = router;