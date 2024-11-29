const Pembina = require('./model');
const authModel = require('../authenticate/model');
const path = require('path');
const fs = require('fs');
const config = require('../../config');

const urlpath = 'admin/pembina';

module.exports = {
  index: async (req, res) => {
    try {
      const alertMessage = req.flash('alertMessage');
      const alertStatus = req.flash('alertStatus');
      const alert = { message: alertMessage, status: alertStatus };

      const pembina = await Pembina.find();

      res.render(`${urlpath}/view_pembina`, {
        title: 'Pembina',
        pembina,
        alert
      })
    } catch (err) {
      req.flash('alertMessage', `${err.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/pembina')
    }
  },
  viewCreate: async (req, res) => {
    try {
      res.render(`${urlpath}/create`, {
        title: 'Tambah Pembina'
      })
    } catch (err) {
      req.flash('alertMessage', `${err.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/pembina')
    }
  },
  actionCreate: async (req, res) => {
    try {
      const { name, nip, job_title, pangkat, golongan } = req.body;

      const noInduk = nip.replace(/ /gi, '');

      if (req.file) {
        let tmp_path = req.file.path;
        let originalExt = req.file.originalname.split('.')[req.file.originalname.split('.').length - 1];
        let filename = req.file.filename + '.' + originalExt;
        let target_path = path.resolve(config.rootPath, `${config.urlUploads}/${filename}`);

        const src = fs.createReadStream(tmp_path);
        const dest = fs.createWriteStream(target_path);

        src.pipe(dest)
        src.on('end', async () => {
          try {
            const pembina = new Pembina({
              name: name.trim().toLowerCase(),
              nip: noInduk,
              job_title: job_title.trim().toLowerCase(),
              pangkat: pangkat.trim().toLowerCase(),
              golongan: golongan.trim().toLowerCase(),
              password: noInduk,
              avatar: filename
            });
            await pembina.save();
            delete pembina._doc.password;

            req.flash('alertMessage', 'Berhasil Menambah Pembina');
            req.flash('alertStatus', 'success');
            res.redirect('/pembina');
          } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/pembina');
          }
        })
      } else {
        const pembina = new Pembina({
          name: name.trim().toLowerCase(),
          nip: noInduk,
          password: noInduk,
          job_title: job_title.trim().toLowerCase(),
          pangkat: pangkat.trim().toLowerCase(),
          golongan: golongan.trim().toLowerCase(),
        });
        await pembina.save();
        delete pembina._doc.password;

        req.flash('alertMessage', 'Berhasil Menambah Pembina');
        req.flash('alertStatus', 'success');
        res.redirect('/pembina');
      }
    } catch (err) {
      req.flash('alertMessage', `${err.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/pembina')
    }
  },
  viewDetail: async (req, res) => {
    try {
      const { id } = req.params;
      const pembina = await Pembina.findById(id);
      const imgURL = config.urlIMG;
      const uploadURL = config.urlUploads;

      res.render(`${urlpath}/detail`, {
        title: 'Detail Pembina',
        imgURL,
        uploadURL,
        pembina
      })
    } catch (err) {
      req.flash('alertMessage', `${err.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/pembina')
    }
  },
  actionDelete: async (req, res) => {
    try {
      const { id } = req.params;

      const pembina = await Pembina.findOneAndRemove({
        _id: id
      });

      let currentImage = `${config.rootPath}/${config.urlUploads}/${pembina.avatar}`;
      if (fs.existsSync(currentImage)) {
        fs.unlinkSync(currentImage)
      }

      req.flash('alertMessage', 'Berhasil Menghapus Data Pembina');
      req.flash('alertStatus', 'success');
      res.redirect('/pembina')
    } catch (err) {
      req.flash('alertMessage', `${err.message}`)
      req.flash('alertStatus', 'danger')
      res.redirect('/pembina')
    }
  },
  actionStatus: async (req, res) => {
    try {
      const { id } = req.params;
      let pembina = await Pembina.findOne({ _id: id })
      let allPembina = await Pembina.countDocuments({ status: 'Y' });
      let status;
      if (pembina.status === 'N') {
        if (allPembina === 1) {
          throw Error('Tidak bisa ada 2 Akun pembina yang aktif')
        } else {
          status = "Y";
        }
      } else {
        status = "N";
      }

      // status = pembina.status === 'Y' ? 'N' : 'Y';
      let message = status === 'Y' ? 'Akun user telah aktif' : 'Akun user telah di non-aktif';

      await Pembina.findOneAndUpdate({ _id: id }, { status })

      req.flash('alertMessage', message);
      req.flash('alertStatus', 'success');
      res.redirect('/pembina');
    } catch (err) {
      req.flash('alertMessage', `${err.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/pembina');
    }
  }
}