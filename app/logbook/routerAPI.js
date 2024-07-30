var express = require('express');
const multer = require('multer')
const os = require('os')
var router = express.Router();
const { createLogbook, deleteLogbook, updateLogbook, acceptLogbook } = require('./controller');
const { isLoginUser } = require('../middleware/auth');

/* GET home page. */
router.post('/', isLoginUser, createLogbook);
router.put('/update/:id', isLoginUser, updateLogbook);
router.put('/:id', isLoginUser, acceptLogbook);
router.delete('/:id', isLoginUser, deleteLogbook);
// router.get('/detail/:id', multer({ dest: os.tmpdir() }).single('photo_profile'), viewDetail);

module.exports = router;