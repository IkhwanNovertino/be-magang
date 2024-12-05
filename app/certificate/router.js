const express = require('express');
const router = express.Router();
const { index, template } = require('./controller');

// const { isLoginUser } = require('../middleware/auth');
/* GET home page. */
router.get('/', index);
router.get('/template', template);

module.exports = router;