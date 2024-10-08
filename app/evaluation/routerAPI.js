const express = require('express');
const router = express.Router();
const { createEvaluation, getEvaluationById, deleteScoreEvaluation } = require('./controller');

const { isLoginUser } = require('../middleware/auth');
/* GET home page. */
router.post('/', isLoginUser, createEvaluation);
router.get('/:id', isLoginUser, getEvaluationById);
router.put('/:id', isLoginUser, deleteScoreEvaluation);

module.exports = router;