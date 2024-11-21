const express = require('express');
const router = express.Router();
const { index } = require('./controller');

// const { isLoginUser } = require('../middleware/auth');
/* GET home page. */
router.get('/', index);
// router.get('/:id', getCertificateById);
// router.put('/:id', isLoginUser, updateEvaluation);

module.exports = router;