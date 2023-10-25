const Vacancy = require('./model');
const { dateFormat, dateForm } = require('../../utils')

const path = 'admin/vacancy';

module.exports = {
  index: async (req, res) => {
    try {
      const alertMessage = req.flash('alertMessage');
      const alertStatus = req.flash('alertStatus');
      const alert = { message: alertMessage, status: alertStatus };

      const vacancy = await Vacancy.find();

      res.render(`${path}/view_vacancy`, {
        title: 'Lowogan Magang',
        vacancy,
        dateFormat,
        alert
      })
    } catch (err) {
      req.flash('alertMessage', `${err.message}`);
      req.flash('alertStatus', 'danger');
      console.log(`error di index controller vacancy >>${err}`);
      res.redirect('/vacancy')
    }
  },
  viewCreate: async (req, res) => {
    try {
      res.render(`${path}/create`, {
        title: 'Tambah Lowongan Magang'
      })
    } catch (err) {
      req.flash('alertMessage', `${err.message}`);
      req.flash('alertStatus', 'danger');

      res.redirect('/vacancy')
    }
  },
  actionCreate: async (req, res) => {
    try {

      const { position, job_desc, requirement, duration, start_an_intern } = req.body;

      let vacancy = await Vacancy({
        position: position.trim().toLowerCase(),
        job_desc: job_desc.trim().toLowerCase(),
        requirement: requirement.trim().toLowerCase().split(';'),
        duration: duration.trim().toLowerCase(),
        start_an_intern: Date.parse(start_an_intern)
      });
      await vacancy.save();

      req.flash('alertMessage', 'Berhasil Menambah Lowongan Magang');
      req.flash('alertStatus', 'success');

      res.redirect('/vacancy');

      // res.send(req.body);
    } catch (err) {
      req.flash('alertMessage', `${err.message}`);
      req.flash('alertStatus', 'danger');

      console.log(`error di actionCreate controller vacancy >>${err}`);
      res.redirect('/biro')
    }
  },
  viewEdit: async (req, res) => {
    try {
      const { id } = req.params;
      const vacancy = await Vacancy.findById(id);

      res.render(`${path}/edit`, {
        title: 'Ubah Lowongan Magang',
        vacancy,
        dateForm
      })
    } catch (err) {
      req.flash('alertMessage', `${err.message}`);
      req.flash('alertStatus', 'danger');

      console.log(`error di viewEdit controller biro >>${err}`);
      res.redirect('/biro')
    }
  },
  actionEdit: async (req, res) => {
    try {
      const { id } = req.params;
      const { position, job_desc, requirement, duration, start_an_intern } = req.body;

      // res.send(req.body)

      await Vacancy.findOneAndUpdate({ _id: id },
        {
          position: position.trim().toLowerCase(),
          job_desc: job_desc.trim().toLowerCase(),
          requirement: requirement.trim().toLowerCase().split(';'),
          duration: duration.trim().toLowerCase(),
          start_an_intern: Date.parse(start_an_intern)
        });

      req.flash('alertMessage', 'Berhasil Mengubah Lowongan Magang');
      req.flash('alertStatus', 'success');

      res.redirect('/vacancy');
    } catch (err) {
      req.flash('alertMessage', `${err.message}`);
      req.flash('alertStatus', 'danger');

      console.log(`error di actionEdit controller vacancy >>${err}`);
      res.redirect('/vacancy')
    }
  },
  actionDelete: async (req, res) => {
    try {
      // const { id } = req.params;
      // await Biro.findOneAndRemove({ _id: id });

      req.flash('alertMessage', 'Berhasil Menghapus Bidang Kegiatan');
      req.flash('alertStatus', 'success');

      res.redirect('/biro');
    } catch (err) {
      req.flash('alertMessage', `${err.message}`);
      req.flash('alertStatus', 'danger');

      console.log(`error di actionDelete controller biro >>${err}`);
      res.redirect('/biro')
    }
  },
}