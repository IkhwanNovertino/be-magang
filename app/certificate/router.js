const express = require('express');
const router = express.Router();
const { index, template, viewCertificate, downloadFileCertificate } = require('./controller');

// const { isLoginUser } = require('../middleware/auth');
/* GET home page. */
router.get('/', index);
router.get('/create', viewCertificate);
router.get('/template', template);
router.get('/download/:file', downloadFileCertificate);

module.exports = router;