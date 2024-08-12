var express = require('express');
var router = express.Router();
const { index, viewDetail, viewCreate, actionCreate, actionDelete } = require('./controller')

/* GET home page. */
router.get('/', index);
router.get('/create', viewCreate);
router.post('/create', actionCreate);
router.get('/detail/:id', viewDetail);
router.delete('/delete/:id', actionDelete);

module.exports = router;