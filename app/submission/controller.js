const submission = require('./model');

const urlpath = 'admin/submission';

module.exports = {
  index: async (req, res) => {
    try {
      const alertMessage = req.flash('alertMessage');
      const alertStatus = req.flash('alertStatus');
      const alert = { message: alertMessage, status: alertStatus };

      // const submission = await Submission.find();

      res.render(`${urlpath}/view_submission`, {
        title: 'Pengajuan Magang',
        alert
      })
    } catch (err) {
      req.flash('alertMessage', `${err.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/submission')
    }
  },


  // API
  actionCreate: async (req, res) => {
    try {
      
    } catch (err) {
      res.status(500).json({
        data: {
          message: err.message || 'Terjadi kesalahan pada server'
        }
      });
    }
  }
}