var express = require('express');
var router = express.Router();
const { getRecapitulation } = require('./controller');

router.get('/', getRecapitulation);
router.get('/:download', getRecapitulation);

module.exports = router;