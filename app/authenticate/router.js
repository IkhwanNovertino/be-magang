var express = require('express');
var router = express.Router();
const { signup, signin } = require('./controller')

/* GET home page. */
router.post('/signup', signup);
router.post('/signin', signin);
// router.get('/create', viewCreate);
// router.post('/create', actionCreate);
// router.get('/edit/:id', viewEdit);
// router.put('/edit/:id', actionEdit);
// router.delete('/delete/:id', actionDelete);


module.exports = router;