var express = require('express');
const multer = require('multer')
const os = require('os')
var router = express.Router();
const { index, viewDetail, actionStatus } = require('./controller')

/* GET home page. */
router.get('/', index);
router.get('/detail/:id', multer({ dest: os.tmpdir() }).single('photo_profile'), viewDetail);
// router.get('/detail/:id', viewDetail);
router.put('/status/:id', actionStatus)
// router.get('/create', viewCreate);
// router.post('/create', multer({ dest: os.tmpdir() }).single('photo_profile'), actionCreate);
// router.delete('/delete/:id', actionDelete);

module.exports = router;