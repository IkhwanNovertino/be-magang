const Peg_umpeg = require('./model');
const path = require('path');
const fs = require('fs');
const config = require('../../config');
const authModel = require('../authenticate/model');

const urlpath = 'admin/peg-umpeg';

module.exports = {
  index: async (req, res) => {
    try {
      const alertMessage = req.flash('alertMessage');
      const alertStatus = req.flash('alertStatus');
      const alert = { message: alertMessage, status: alertStatus };

      const peg_umpeg = await Peg_umpeg.find();

      res.render(`${urlpath}/view_pegumpeg`, {
        title: 'Pegawai Umpeg',
        peg_umpeg,
        alert
      })
    } catch (err) {
      req.flash('alertMessage', `${err.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/pegumpeg')
    }
  },
  viewCreate: async (req, res) => {
    try {
      res.render(`${urlpath}/create`, {
        title: 'Tambah Pegawai Umpeg'
      })
    } catch (err) {
      req.flash('alertMessage', `${err.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/pegumpeg')
    }
  },
  actionCreate: async (req, res) => {
    try {
      const { name, nip, job_title, email, phone_num } = req.body;

      const noInduk = nip.replace(/ /gi, '');

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
            const peg_umpeg = new Peg_umpeg({
              name: name.trim().toLowerCase(),
              nip: noInduk,
              job_title: job_title.trim().toLowerCase(),
              email: email.trim(),
              phone_num,
              password: noInduk,
              avatar: filename
            });
            await peg_umpeg.save();

            delete peg_umpeg._doc.password;

            req.flash('alertMessage', 'Berhasil Menambah Pegawai Umpeg');
            req.flash('alertStatus', 'success');
            res.redirect('/pegumpeg');
          } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/pegumpeg');
          }
        })
      } else {
        const peg_umpeg = new Peg_umpeg({
          name: name.trim().toLowerCase(),
          nip: noInduk,
          job_title: job_title.trim().toLowerCase(),
          email: email.trim(),
          phone_num,
          password: noInduk,
        });
        await peg_umpeg.save();

        delete peg_umpeg._doc.password;

        req.flash('alertMessage', 'Berhasil Menambah Pegawai Umpeg');
        req.flash('alertStatus', 'success');
        res.redirect('/pegumpeg');
      }
    } catch (err) {
      req.flash('alertMessage', `${err.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/pegumpeg')
    }
  },
  viewDetail: async (req, res) => {
    try {
      const { id } = req.params;
      const peg_umpeg = await Peg_umpeg.findById(id);

      res.render(`${urlpath}/detail`, {
        title: 'Detail Pegawai Umpeg',
        peg_umpeg
      })
    } catch (err) {
      req.flash('alertMessage', `${err.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/pegumpeg')
    }
  },
  actionDelete: async (req, res) => {
    try {
      const { id } = req.params;

      const peg_umpeg = await Peg_umpeg.findOneAndRemove({
        _id: id
      });

      let currentImage = `${config.rootPath}/public/uploads/${peg_umpeg.avatar}`;
      if (fs.existsSync(currentImage)) {
        fs.unlinkSync(currentImage)
      }

      req.flash('alertMessage', 'Berhasil Menghapus Data Pegawai Umpeg');
      req.flash('alertStatus', 'success');

      res.redirect('/pegumpeg')
    } catch (err) {
      req.flash('alertMessage', `${err.message}`)
      req.flash('alertStatus', 'danger')
      res.redirect('/pegumpeg')
    }
  },
  actionStatus: async (req, res) => {
    try {
      const { id } = req.params;
      let peg_umpeg = await Peg_umpeg.findOne({ _id: id })

      let status = peg_umpeg.status === 'Y' ? 'N' : 'Y';
      let message = status === 'Y' ? 'Akun user telah aktif' : 'Akun user telah di non-aktif';

      await Peg_umpeg.findOneAndUpdate({ _id: id }, { status });

      req.flash('alertMessage', message);
      req.flash('alertStatus', 'success');
      res.redirect('/pegumpeg')
    } catch (err) {
      req.flash('alertMessage', `${err.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/pegumpeg')
    }
  }
}