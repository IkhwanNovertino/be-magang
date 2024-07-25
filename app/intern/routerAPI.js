var express = require('express');
const multer = require('multer')
const os = require('os')
var router = express.Router();
const { viewDetail, actionStatus, getAllIntern, getInternById } = require('./controller');
const { isLoginUser } = require('../middleware/auth');

/* GET home page. */
router.get('/', isLoginUser, getAllIntern);
router.get('/:id', isLoginUser, getInternById);
router.get('/detail/:id', multer({ dest: os.tmpdir() }).single('photo_profile'), viewDetail);
// router.get('/detail/:id', viewDetail);
router.put('/status/:id', actionStatus)
// router.get('/create', viewCreate);
// router.post('/create', multer({ dest: os.tmpdir() }).single('photo_profile'), actionCreate);
// router.delete('/delete/:id', actionDelete);

module.exports = router;