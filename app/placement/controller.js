const Placement = require('./model');
const Biro = require('../biro/model');
const Supervisor = require('../supervisor/model');
const Intern = require('../intern/model');

const urlpath = 'admin/placement';

module.exports = {
  index: async (req, res) => {
    try {
      const alertMessage = req.flash('alertMessage');
      const alertStatus = req.flash('alertStatus');
      const alert = { message: alertMessage, status: alertStatus };

      const placement = await Placement.find().populate('intern').populate('biro').populate('supervisor');
      console.log(placement);
      res.render(`${urlpath}/view_placement`, {
        title: 'Penempatan Magang',
        placement,
        alert
      })
    } catch (err) {
      req.flash('alertMessage', `${err.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/placement')
    }
  },
  viewCreate: async (req, res) => {
    try {

      const biro = await Biro.find();
      const supervisor = await Supervisor.find();
      const intern = await Intern.find().sort({ createdAt: -1 })

      res.render(`${urlpath}/create`, {
        title: 'Tambah Penempatan Peserta Magang',
        biro,
        supervisor,
        intern,
      });
    } catch (err) {
      req.flash('alertMessage', `${err.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/placement')
    }
  },
  actionCreate: async (req, res) => {
    try {
      const { intern, supervisor, biro } = req.body;
      const placement = new Placement({
        intern, supervisor, biro
      })

      await placement.save();

      res.redirect('/placement');
    } catch (err) {
      req.flash('alertMessage', `${err.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/placement')
    }
  },
  viewDetail: async (req, res) => {
    try {
      const { id } = req.params;
      const placement = await Placement.findById(id).populate('intern').populate('supervisor').populate('biro');

      res.render(`${urlpath}/detail`, {
        title: 'Detail Penempatan Magang',
        placement,
      })
    } catch (err) {
      req.flash('alertMessage', `${err.message}`);
      req.flash('alertStatus', 'danger');

      res.redirect('/placement');
    }
  },
  actionDelete: async (req, res) => {
    try {
      const { id } = req.params;

      const placement = await Placement.findOneAndRemove({
        _id: id
      });

      req.flash('alertMessage', 'Berhasil Menghapus Data Penempatan');
      req.flash('alertStatus', 'success');
      res.redirect('/placement')
    } catch (err) {
      req.flash('alertMessage', `${err.message}`)
      req.flash('alertStatus', 'danger')
      res.redirect('/placement')
    }
  },
};