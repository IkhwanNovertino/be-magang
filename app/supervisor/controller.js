const Supervisor = require('./model');
const path = require('path');
const fs = require('fs');
const config = require('../../config')

const urlpath = 'admin/supervisor';

module.exports = {
  index: async (req, res) => {
    try {
      const alertMessage = req.flash('alertMessage');
      const alertStatus = req.flash('alertStatus');
      const alert = { message: alertMessage, status: alertStatus };

      // const biro = await Biro.find();

      res.render(`${urlpath}/view_supervisor`, {
        title: 'Pembimbing',
        alert
      })
    } catch (err) {
      req.flash('alertMessage', `${err.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/supervisor')
    }
  },
  viewCreate: async (req, res) => {
    try {
      res.render(`${urlpath}/create`, {
        title: 'Tambah Bidang Kegiatan'
      })
    } catch (err) {
      req.flash('alertMessage', `${err.message}`);
      req.flash('alertStatus', 'danger');

      res.redirect('/supervisor')
    }
  },
  actionCreate: async (req, res) => {
    try {
      const { name, nip, job_title, email, phone_num } = req.body;

      if (req.file) {
        let tmp_path = req.file.path;
        let originalExt = req.file.originalname.split('.')[req.file.originalname.split('.').length - 1];
        let filename = req.file.filename + '.' + originalExt;
        let target_path = path.resolve(config.rootPath, `public/uploads/${filename}`);

        const src = fs.createReadStream(tmp_path);
        const dest = fs.createWriteStream(target_path);

        src.pipe(dest)
        src.on('end', async () => {
          try {
            const supervisor = new Supervisor({
              name, nip, job_title,
              contact: {
                email: email.trim() === "" ? 'default@email.com' : email,
                phone_num: phone_num.trim() === "" ? 1 : phone_num,
              },
              photo_profile: filename
            });
            await supervisor.save();

            req.flash('alertMessage', 'Berhasil Menambah Pembimbing');
            req.flash('alertStatus', 'success');
            res.redirect('/supervisor');
          } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/supervisor');
          }
        })
      } else {
        const supervisor = new Supervisor({
          name, nip, job_title,
          contact: {
            email,
            phone_num,
          },
        });
        await supervisor.save();

        req.flash('alertMessage', 'Berhasil Menambah Pembimbing');
        req.flash('alertStatus', 'success');
        res.redirect('/supervisor');
      }
    } catch (err) {
      req.flash('alertMessage', `${err.message}`);
      req.flash('alertStatus', 'danger');

      res.redirect('/supervisor')
    }
  },
  viewEdit: async (req, res) => {
    try {
      const { id } = req.params;
      // const biro = await Biro.findById(id);

      res.render(`${path}/edit`, {
        title: 'Ubah Bidang Kegiatan',
        biro
      })
    } catch (err) {
      req.flash('alertMessage', `${err.message}`);
      req.flash('alertStatus', 'danger');

      res.redirect('/supervisor')
    }
  },
  actionEdit: async (req, res) => {
    try {
      // const { id } = req.params;
      // const { name } = req.body;

      // await Biro.findOneAndUpdate({ _id: id }, { name: name });

      req.flash('alertMessage', 'Berhasil Mengubah Bidang Kegiatan');
      req.flash('alertStatus', 'success');

      res.redirect('/supervisor');
    } catch (err) {
      req.flash('alertMessage', `${err.message}`);
      req.flash('alertStatus', 'danger');

      res.redirect('/supervisor')
    }
  },
  actionDelete: async (req, res) => {
    try {
      // const { id } = req.params;
      // await Biro.findOneAndRemove({ _id: id });

      req.flash('alertMessage', 'Berhasil Menghapus Bidang Kegiatan');
      req.flash('alertStatus', 'success');

      res.redirect('/supervisor');
    } catch (err) {
      req.flash('alertMessage', `${err.message}`);
      req.flash('alertStatus', 'danger');

      res.redirect('/supervisor')
    }
  },
}