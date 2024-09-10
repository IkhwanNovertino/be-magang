const Intern = require('./model');
const Placement = require('../placement/model');
const Logbook = require('../logbook/model');
const Evaluate = require('../evaluation/model');

const { dateFormat } = require('../../utils/index');
const urlpath = 'admin/intern';

module.exports = {
  index: async (req, res) => {
    try {
      const alertMessage = req.flash('alertMessage');
      const alertStatus = req.flash('alertStatus');
      const alert = { message: alertMessage, status: alertStatus };

      const intern = await Intern.find().sort({ createdAt: -1 });

      res.render(`${urlpath}/view_interns`, {
        title: 'Peserta Magang',
        intern,
        alert
      })
    } catch (err) {
      req.flash('alertMessage', `${err.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/intern')
    }
  },
  viewDetail: async (req, res) => {
    try {
      const { id } = req.params;
      const intern = await Intern.findById(id);

      res.render(`${urlpath}/detail`, {
        title: 'Detail Peserta Magang',
        intern,
        dateFormat,
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
      console.log(Date(intern.start_an_internship));
      console.log();
      if (Date.now() >= intern.start_an_internship) {
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
      res.redirect('/intern')
    }
  },

  // API
  getAllIntern: async (req, res) => {
    try {
      if (req.user.role === 'supervisor') {
        const intern = await Placement.find({ supervisor: req.user.id })
          .populate('intern')
          .populate('biro')
          .sort({ createdAt: -1 })
        res.status(200).json({
          data: intern,
        })
      } else {
        const intern = await Intern.find().sort({ createdAt: -1 });
        res.status(200).json({
          data: {
            intern,
          }
        });
      }
    } catch (err) {
      return res.status(500).json({ message: err.message || 'Terjadi kesalahan pada server' });
    }
  },
  getInternById: async (req, res) => {
    try {
      const { id } = req.params;

      const intern = await Intern.findOne({ _id: id }).populate('submissionID');
      const placement = await Placement.find({ intern: id }).populate('supervisor').populate('biro');
      const logbook = await Logbook.find({ intern: id });
      const evaluate = await Evaluate.find()

      let data = {
        intern, placement, logbook
      };

      return res.status(200).json({
        data
      });
    } catch (err) {
      return res.status(404).json({ message: ['data tidak ditemukan', err.message], field: 'id' });
    }
  },
  // DASHBOARD INTERN/PESERTA MAGANG
  dashboard: async (req, res) => {
    try {
      const { id } = req.user;
      const intern = await Intern.findOne({ _id: id });
      const placement = await Placement.findOne({ intern: id }).populate('supervisor').populate('biro');
      const logbook = await Logbook.find({ intern: id });
      const evaluate = await Evaluate.findOne({ intern: id }).populate('score.title');

      const data = {
        name: intern.name,
        supervisor: placement.supervisor.name,
        biro: placement.biro.name,
        startAnIntern: intern.start_an_internship,
        endAnIntern: intern.end_an_internship,
        logbook: logbook,
        evaluate: evaluate,
      };
      res.status(200).json({ data });
    } catch (err) {
      console.log(err);
      res.status(404).json({
        message: [err.message]
      });
    }
  }
};