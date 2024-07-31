const express = require('express');
const router = express.Router();
const { createEvaluation } = require('./controller');

const { isLoginUser } = require('../middleware/auth');
/* GET home page. */
router.post('/', isLoginUser, createEvaluation);
// router.get('/', isLoginUser, getScoreComponent);

module.exports = router;