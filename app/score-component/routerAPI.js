var express = require('express');
var router = express.Router();
const { createScoreComponent, getScoreComponent } = require('./controller');

const { isLoginUser } = require('../middleware/auth');
/* GET home page. */
router.post('/', isLoginUser, createScoreComponent);
router.get('/', isLoginUser, getScoreComponent);

module.exports = router;