const urlpath = 'admin/intern';

module.exports = {
  index: async (req, res) => {
    try {
      const alertMessage = req.flash('alertMessage');
      const alertStatus = req.flash('alertStatus');
      const alert = { message: alertMessage, status: alertStatus };

      // const submission = await Submission.find().populate('applicant');
      // console.log(submission);
      res.render(`${urlpath}/view_interns`, {
        title: 'Peserta Magang',
        alert
      })
    } catch (err) {
      req.flash('alertMessage', `${err.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/inten')
    }
  },
};