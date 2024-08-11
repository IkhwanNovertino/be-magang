var express = require('express');
var router = express.Router();
const { deleteLogbook, updateLogbook, acceptLogbook, index, viewLogbook } = require('./controller');
// const { isLoginUser } = require('../middleware/auth');

/* GET home page. */
router.get('/', index);
router.get('/', viewLogbook);
// router.put('/update/:id', isLoginUser, updateLogbook);
// router.put('/:id', isLoginUser, acceptLogbook);
// router.delete('/:id', isLoginUser, deleteLogbook);

module.exports = router;