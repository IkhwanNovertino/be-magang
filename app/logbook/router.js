var express = require('express');
var router = express.Router();
const { index, viewLogbook } = require('./controller');
// const { isLoginUser } = require('../middleware/auth');

/* GET home page. */
router.get('/', index);
router.get('/create', viewLogbook);

module.exports = router;