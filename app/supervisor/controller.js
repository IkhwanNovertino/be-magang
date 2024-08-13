const Supervisor = require('./model');
const path = require('path');
const fs = require('fs');
const config = require('../../config');

const urlpath = 'admin/supervisor';

module.exports = {
  index: async (req, res) => {
    try {
      const alertMessage = req.flash('alertMessage');
      const alertStatus = req.flash('alertStatus');
      const alert = { message: alertMessage, status: alertStatus };

      const supervisor = await Supervisor.find();

      res.render(`${urlpath}/view_supervisor`, {
        title: 'Pembimbing',
        supervisor,
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
        title: 'Tambah Pembimbing'
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
            const supervisor = new Supervisor({
              name: name.trim().toLowerCase(),
              nip: noInduk,
              job_title: job_title.trim().toLowerCase(),
              email: email.trim(),
              phone_num,
              password: noInduk,
              avatar: filename
            });
            await supervisor.save();
            delete supervisor._doc.password

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
          name: name.trim().toLowerCase(),
          nip: noInduk,
          job_title: job_title.trim().toLowerCase(),
          email: email.trim(),
          phone_num,
          password: noInduk,
        });
        await supervisor.save();
        delete supervisor._doc.password

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
  viewDetail: async (req, res) => {
    try {
      const { id } = req.params;
      const supervisor = await Supervisor.findById(id);
      const imgURL = config.urlIMG;

      res.render(`${urlpath}/detail`, {
        title: 'Detail Pembimbing',
        supervisor,
        imgURL,
      })
    } catch (err) {
      req.flash('alertMessage', `${err.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/supervisor')
    }
  },
  actionDelete: async (req, res) => {
    try {
      const { id } = req.params;

      const supervisor = await Supervisor.findOneAndRemove({
        _id: id
      });

      let currentImage = `${config.rootPath}/public/uploads/${supervisor.avatar}`;
      if (fs.existsSync(currentImage)) {
        fs.unlinkSync(currentImage)
      }

      req.flash('alertMessage', 'Berhasil Menghapus Data Pembimbing');
      req.flash('alertStatus', 'success');
      res.redirect('/supervisor');
    } catch (err) {
      req.flash('alertMessage', `${err.message}`)
      req.flash('alertStatus', 'danger')
      res.redirect('/supervisor');
    }
  },
  actionStatus: async (req, res) => {
    try {
      const { id } = req.params;
      let supervisor = await Supervisor.findOne({ _id: id })

      let status = supervisor.status === 'Y' ? 'N' : 'Y';
      let message = status === 'Y' ? 'Akun user telah aktif' : 'Akun user telah di non-aktif';

      await Supervisor.findOneAndUpdate({ _id: id }, { status })

      req.flash('alertMessage', message);
      req.flash('alertStatus', 'success');
      res.redirect('/supervisor');
    } catch (err) {
      req.flash('alertMessage', `${err.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/supervisor');
    }
  }
}