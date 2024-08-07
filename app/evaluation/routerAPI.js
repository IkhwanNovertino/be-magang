const express = require('express');
const router = express.Router();
const { createEvaluation, getEvaluationById, updateEvaluation } = require('./controller');

const { isLoginUser } = require('../middleware/auth');
/* GET home page. */
router.post('/', isLoginUser, createEvaluation);
router.get('/:id', isLoginUser, getEvaluationById);
router.put('/:id', isLoginUser, updateEvaluation);

module.exports = router;