const Intern = require('./model');
const Placement = require('../placement/model');

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
  actionStatus: async (req, res) => {
    try {
      const { id } = req.params;
      let intern = await Intern.findOne({ _id: id })

      if (Date.now() >= Date(intern.start_an_internship)) {
        let status = intern.status === 'Y' ? 'N' : 'Y';
        let statusIntern = 'active';
        await Intern.findOneAndUpdate({ _id: id }, { status, statusIntern });

        req.flash('alertMessage', 'Akun Peserta Telah Aktif');
        req.flash('alertStatus', 'success');
        res.redirect('/intern')
      } else {
        req.flash('alertMessage', `Akun tidak bisa diaktifkan. Sesuaikan dengan tanggal mulai magang`);
        req.flash('alertStatus', 'danger');
        res.redirect('/intern')
      }
    } catch (err) {
      req.flash('alertMessage', `${err.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/inten')
    }
  },

  // API
  getAllIntern: async (req, res) => {
    try {
      const intern = await Intern.find().sort({ createdAt: -1 });
      return res.status(200).json({
        data: {
          intern,
        }
      });
    } catch (err) {
      return res.status(500).json({ message: err.message || 'Terjadi kesalahan pada server' });
    }
  },
  getInternById: async (req, res) => {
    try {
      const { id } = req.params;
      const intern = await Intern.findById(id).populate('submissionID');
      const placement = await Placement.find({ intern: id }).populate('supervisor').populate('biro');

      let payload = {
        intern, placement
      };

      return res.status(200).json({
        data: {
          payload,
        }
      });
    } catch (err) {
      return res.status(404).json({ message: ['data tidak ditemukan'], field: 'id' });
    }
  },
};