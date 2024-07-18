var express = require('express');
const multer = require('multer')
const os = require('os')
var router = express.Router();
// const { index, viewCreate, actionCreate, actionDelete, viewDetail, actionStatus } = require('./controller')

/* GET home page. */
// router.get('/', index);
// router.get('/create', viewCreate);
// router.post('/create', multer({ dest: os.tmpdir() }).single('photo_profile'), actionCreate);
// router.get('/detail/:id', multer({ dest: os.tmpdir() }).single('photo_profile'), viewDetail);
// router.delete('/delete/:id', actionDelete);
// router.put('/status/:id', actionStatus)

const { isLoginUser } = require('../middleware/auth');
const { saveSubmission, getAllSubmission, getSubmissionById, setSubmissionStatus, setSubmmissionSuccess } = require('./controller');


router.get('/', isLoginUser, getAllSubmission);
router.get('/:id', isLoginUser, getSubmissionById)
router.post('/',
  isLoginUser,
  multer({ dest: os.tmpdir() }).single('offering_letter'),
  saveSubmission
);
router.put('/status/:id', isLoginUser, setSubmissionStatus);
router.put('/:id', isLoginUser, multer({ dest: os.tmpdir() }).single('acceptance_letter'), setSubmmissionSuccess);
module.exports = router;