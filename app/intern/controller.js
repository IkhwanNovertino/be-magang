const Intern = require('./model');
const Placement = require('../placement/model');
const Logbook = require('../logbook/model');
const Certificate = require('../certificate/model');
const Pembina = require('../pembina/model');

const { dateFormat } = require('../../utils/index');
const urlpath = 'admin/intern';

module.exports = {
  index: async (req, res) => {
    try {
      const alertMessage = req.flash('alertMessage');
      const alertStatus = req.flash('alertStatus');
      const alert = { message: alertMessage, status: alertStatus };

      const internPending = await Intern.find({ statusIntern: 'pending' }).sort({ createdAt: -1 });
      const internActive = await Intern.find({ statusIntern: 'active' }).sort({ createdAt: -1 });
      const internFinish = await Intern.find({ statusIntern: 'finish' }).sort({ createdAt: -1 });

      const intern = [...internPending, ...internActive, ...internFinish]

      res.render(`${urlpath}/view_interns`, {
        title: 'Peserta Magang',
        intern,
        alert,
        dateFormat
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
      const data = [];
      if (req.user.role === 'supervisor') {
        const intern = await Placement.find({ supervisor: req.user.id })
          .populate('intern')
          .populate('biro')
          .sort({ start_an_internship: -1 })

        intern.forEach((item, index) => {
          data.push({
            _id: item.intern._id,
            name: item.intern.name,
            id_num: item.intern.id_num,
            start_an_internship: item.intern.start_an_internship,
            end_an_internship: item.intern.end_an_internship,
            institute: item.intern.institute,
            major: item.intern.major,
            statusIntern: item.intern.statusIntern,
            biro: item.biro.name,
          })
        });

        res.status(200).json({
          data: data
        })
      } else {
        const intern = await Intern.find().sort({ start_an_internship: -1 });
        res.status(200).json({
          data: intern,
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
      const logbook = await Logbook.find({ intern: id }).sort({ createdAt: -1 }).limit(5)
      const certificate = await Certificate.findOne({ intern: id });

      let data = {
        _id: intern._id,
        name: intern.name,
        id_num: intern.id_num,
        institute: intern.institute,
        major: intern.major,
        start_an_internship: intern.start_an_internship,
        end_an_internship: intern.end_an_internship,
        email: intern.email,
        phone_num: intern.phone_num,
        offering_letter: intern.submissionID.offering_letter,
        acceptance_letter: intern.submissionID.acceptance_letter,
        statusIntern: intern.statusIntern,
        logbook: logbook,
        placement: placement,
        certificate: !certificate ? null : certificate,
      };

      if (req.user.role === 'pembina') {
        if (certificate && certificate?.historyPembina?.name === '') {
          const pembina = await Pembina.findOne({ _id: req.user.id });

          data.certificate.historyPembina.name = pembina.name;
          data.certificate.historyPembina.nip = pembina.nip;
          data.certificate.historyPembina.position = pembina.job_title;
          data.certificate.historyPembina.pangkat = pembina.pangkat;
        }
      }

      return res.status(200).json({
        data
      });
    } catch (err) {
      return res.status(404).json({
        errors: {
          message: ['data tidak ditemukan', err.message]
        }
      });
    }
  },
  // DASHBOARD INTERN/PESERTA MAGANG
  dashboard: async (req, res) => {
    try {
      const { id } = req.user;
      const intern = await Intern.findOne({ _id: id });
      const placement = await Placement.findOne({ intern: id }).populate('supervisor').populate('biro');
      const logbook = await Logbook.find({ intern: id }).sort({ createdAt: -1 }).limit(5);
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
        errors: {
          message: ['data tidak ditemukan', err.message],
        }
      });
    }
  }
};