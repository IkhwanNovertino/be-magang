var express = require('express');
const multer = require('multer')
const os = require('os')
var router = express.Router();
const { index, viewDetail, viewCreate, actionCreate, actionDelete } = require('./controller')

/* GET home page. */
router.get('/', index);
router.get('/create', viewCreate);
router.post('/create', actionCreate);
router.get('/detail/:id', viewDetail);
router.delete('/delete/:id', actionDelete);

module.exports = router;