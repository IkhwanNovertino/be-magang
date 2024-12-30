var express = require('express');
var router = express.Router();
const { index, viewCreate, actionPrint } = require('./controller')

/* GET home page. */
router.get('/', index);
router.get('/create', viewCreate)
router.get('/print', actionPrint);
// router.post('/create', actionCreate);
// router.get('/edit/:id', viewEdit);
// router.put('/edit/:id', actionEdit);
// router.delete('/delete/:id', actionDelete);


module.exports = router;