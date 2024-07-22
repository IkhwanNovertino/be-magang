const Intern = require('./model');

const urlpath = 'admin/intern';

module.exports = {
  index: async (req, res) => {
    try {
      const alertMessage = req.flash('alertMessage');
      const alertStatus = req.flash('alertStatus');
      const alert = { message: alertMessage, status: alertStatus };

      const intern = await Intern.find();
      console.log(intern);
      res.render(`${urlpath}/view_interns`, {
        title: 'Peserta Magang',
        intern,
        alert
      })
    } catch (err) {
      req.flash('alertMessage', `${err.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/inten')
    }
  },
  viewDetail: async (req, res) => {
    try {
      const { id } = req.params;
      const intern = await Intern.findById(id);

      res.render(`${urlpath}/detail`, {
        title: 'Detail Peserta Magang',
        intern,
      })
    } catch (err) {
      req.flash('alertMessage', `${err.message}`);
      req.flash('alertStatus', 'danger');

      res.redirect('/intern')
    }
  },
};