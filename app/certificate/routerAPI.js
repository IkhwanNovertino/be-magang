const express = require('express');
const router = express.Router();
const { createCertificate, getCertificateById, approveCertificate } = require('./controller');

const { isLoginUser } = require('../middleware/auth');
/* GET home page. */
router.post('/', isLoginUser, createCertificate);
router.put('/:id', isLoginUser, approveCertificate);
router.get('/:id', getCertificateById);
// router.put('/:id', isLoginUser, updateEvaluation);

module.exports = router;