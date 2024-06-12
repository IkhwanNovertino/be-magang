const config = require('../../config');
const jwt = require('jsonwebtoken');
const Auth = require('../authenticate/model');

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

      const user = await Auth.findOne({ _id: data.user.id })

      if (!user) {
        throw new Error()
      }

      req.user = user
      req.token = token
      next()
    } catch (err) {
      res.status(401).json({ error: 'Not authorized to access this resource' })
    }
  }
}