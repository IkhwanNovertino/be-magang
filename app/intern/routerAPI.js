var express = require('express');
const multer = require('multer')
const os = require('os')
var router = express.Router();
const { getAllIntern, getInternById, dashboard } = require('./controller');
const { isLoginUser } = require('../middleware/auth');

/* GET home page. */
router.get('/', isLoginUser, getAllIntern);
router.get('/dashboard', isLoginUser, dashboard);
router.get('/:id', isLoginUser, getInternById);
// router.get('/detail/:id', multer({ dest: os.tmpdir() }).single('photo_profile'), viewDetail);

module.exports = router;