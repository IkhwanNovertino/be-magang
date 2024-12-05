const config = require('../../config');
const jwt = require('jsonwebtoken');
const ApplicantAuth = require('../applicants/model');
const PembinaAuth = require('../pembina/model');
const SupervisorAuth = require('../supervisor/model');
const UmpegAuth = require('../peg-umpeg/model');
const InternAuth = require('../intern/model');

module.exports = {
  isLoginAdmin: (req, res, next) => {
    if (req.session.user === null || req.session.user === undefined) {
      req.flash('alertMessage', `Mohon maaf sesi anda telah berakhir, silakan Login kembali!`);
      req.flash('alertStatus', 'warning');
      res.redirect('/');
    } else {
      next();
    }
  },
  isLoginUser: async (req, res, next) => {
    try {
      const token = req.headers.authorization ? req.headers.authorization.replace('Bearer ', '') : null;
      const data = jwt.verify(token, config.jwtKey)

      const applicantUser = await ApplicantAuth.findOne({ _id: data.user.id });
      const pembinaUser = await PembinaAuth.findOne({ _id: data.user.id });
      const supervisorUser = await SupervisorAuth.findOne({ _id: data.user.id });
      const umpegUser = await UmpegAuth.findOne({ _id: data.user.id });
      const internUser = await InternAuth.findOne({ _id: data.user.id });
      if (applicantUser || pembinaUser || supervisorUser || umpegUser || internUser) {
        req.user = data.user
        req.token = token
      }

      next()
    } catch (err) {
      res.status(401).json({ error: 'Not authorized to access this resource' })
    }
  }
}