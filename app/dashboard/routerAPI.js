var express = require('express');
var router = express.Router();
const { dashboardUmpeg, dashboardSupervisor, dashboardIntern, dashboardPembina } = require('./controller');
const { isLoginUser } = require('../middleware/auth');

/* GET home page. */
router.get('/umpeg', isLoginUser, dashboardUmpeg);
router.get('/supervisor', isLoginUser, dashboardSupervisor);
router.get('/intern', isLoginUser, dashboardIntern);
router.get('/pembina', isLoginUser, dashboardPembina);

module.exports = router;