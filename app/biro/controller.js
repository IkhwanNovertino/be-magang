const Biro = require('./model');

const path = 'admin/biro';

module.exports = {
  index: async (req, res) => {
    try {
      const alertMessage = req.flash('alertMessage');
      const alertStatus = req.flash('alertStatus');
      const alert = { message: alertMessage, status: alertStatus };

      const biro = await Biro.find();

      res.render(`${path}/view_biro`, {
        title: 'Bidang Kegiatan',
        biro,
        alert
      })
    } catch (err) {
      req.flash('alertMessage', `${err.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/biro')

      console.log(`error di index controller biro >>${err}`);
      // res.redirect('/')
    }
  },
  viewCreate: async (req, res) => {
    try {
      res.render(`${path}/create`, {
        title: 'Tambah Bidang Kegiatan'
      })
    } catch (err) {
      req.flash('alertMessage', `${err.message}`);
      req.flash('alertStatus', 'danger');

      console.log(`error di viewCreate controller biro >>${err}`);
      res.redirect('/biro')
    }
  },
  actionCreate: async (req, res) => {
    try {
      const { name } = req.body;

      let biro = await Biro({ name });
      await biro.save();

      req.flash('alertMessage', 'Berhasil Menambah Bidang Kegiatan');
      req.flash('alertStatus', 'success');

      res.redirect('/biro');

      // res.send(req.body);
    } catch (err) {
      req.flash('alertMessage', `${err.message}`);
      req.flash('alertStatus', 'danger');

      console.log(`error di actionCreate controller biro >>${err}`);
      res.redirect('/biro')
    }
  },
  viewEdit: async (req, res) => {
    try {
      const { id } = req.params;
      const biro = await Biro.findById(id);

      res.render(`${path}/edit`, {
        title: 'Ubah Bidang Kegiatan',
        biro
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
      const { name } = req.body;

      await Biro.findOneAndUpdate({ _id: id }, { name: name });

      req.flash('alertMessage', 'Berhasil Mengubah Bidang Kegiatan');
      req.flash('alertStatus', 'success');

      res.redirect('/biro');
    } catch (err) {
      req.flash('alertMessage', `${err.message}`);
      req.flash('alertStatus', 'danger');

      console.log(`error di actionEdit controller biro >>${err}`);
      res.redirect('/biro')
    }
  },
  actionDelete: async (req, res) => {
    try {
      const { id } = req.params;
      await Biro.findOneAndRemove({ _id: id });

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