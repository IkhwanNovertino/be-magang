var express = require('express');
var router = express.Router();
const { getVacancy, getVacancyById, getTopVacancy } = require('./controller')

/* GET home page. */
router.get('/', getVacancy);
router.get('/topvacancy', getTopVacancy);
router.get('/:id', getVacancyById);

module.exports = router;