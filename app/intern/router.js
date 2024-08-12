var express = require('express');
const multer = require('multer')
const os = require('os')
var router = express.Router();
const { index, viewDetail, actionStatus } = require('./controller')

/* GET home page. */
router.get('/', index);
router.get('/detail/:id', multer({ dest: os.tmpdir() }).single('photo_profile'), viewDetail);
router.put('/status/:id', actionStatus)

module.exports = router;