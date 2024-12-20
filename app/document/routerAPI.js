var express = require('express');
var router = express.Router();

const os = require('os')
const multer = require('multer')

const { isLoginUser } = require('../middleware/auth');
const { downloadFileSubmission, downloadFileCertificate } = require('./controller');


router.get('/offering/:file', downloadFileSubmission);
router.get('/acceptance/:file', downloadFileSubmission);
router.get('/certificate/:file', downloadFileCertificate);

// router.get('/', isLoginUser, getAllSubmission);
// router.get('/:id', isLoginUser, getSubmissionById)
// router.post('/',
//   isLoginUser,
//   multer({ dest: os.tmpdir() }).single('offering_letter'),
//   saveSubmission
// );
// router.put('/status/:id', isLoginUser, setSubmissionStatus);
// router.put('/:id',
//   isLoginUser,
//   multer({ dest: os.tmpdir() }).single('acceptance_letter'),
//   setSubmmissionSuccess
// );
// router.delete('/:id', isLoginUser, actionDelete);

module.exports = router;