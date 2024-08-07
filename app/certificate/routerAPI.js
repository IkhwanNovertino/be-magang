const express = require('express');
const router = express.Router();
const { createCertificate, getCertificateById } = require('./controller');

const { isLoginUser } = require('../middleware/auth');
/* GET home page. */
router.post('/', isLoginUser, createCertificate);
router.get('/:id', getCertificateById);
// router.put('/:id', isLoginUser, updateEvaluation);

module.exports = router;