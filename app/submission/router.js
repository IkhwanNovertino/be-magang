var express = require('express');
const multer = require('multer')
const os = require('os')
var router = express.Router();
// const { index, viewCreate, actionCreate, actionDelete, viewDetail, actionStatus } = require('./controller')

/* GET home page. */
// router.get('/', index);
// router.get('/create', viewCreate);
// router.post('/create', multer({ dest: os.tmpdir() }).single('photo_profile'), actionCreate);
// router.get('/detail/:id', multer({ dest: os.tmpdir() }).single('photo_profile'), viewDetail);
// router.delete('/delete/:id', actionDelete);
// router.put('/status/:id', actionStatus)

const { isLoginUser } = require('../middleware/auth');
const { index, viewDetail, downloadFile } = require('./controller');

router.get('/', index);
router.get('/detail/:id', viewDetail);
router.get('/download/:id', downloadFile);

module.exports = router;