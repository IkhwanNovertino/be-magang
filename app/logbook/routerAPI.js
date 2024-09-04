var express = require('express');
const multer = require('multer')
const os = require('os')
var router = express.Router();
const { createLogbook, deleteLogbook, updateLogbook, acceptLogbook, getAllLogbook, getLogbookById } = require('./controller');
const { isLoginUser } = require('../middleware/auth');

/* GET home page. */
router.get('/', isLoginUser, getAllLogbook);
router.get('/:id', isLoginUser, getLogbookById);
router.post('/', isLoginUser, createLogbook);
router.put('/update/:id', isLoginUser, updateLogbook);
router.put('/:id', isLoginUser, acceptLogbook);
router.delete('/:id', isLoginUser, deleteLogbook);
// router.get('/detail/:id', multer({ dest: os.tmpdir() }).single('photo_profile'), viewDetail);

module.exports = router;