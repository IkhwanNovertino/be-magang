const Logbook = require('./model');
const Intern = require('../intern/model');
const Placement = require('../placement/model');
const mongoose = require('mongoose');
const { dateFormatCertificate } = require('../../utils');

const urlpath = 'admin/logbook';

module.exports = {
  index: async (req, res) => {
    try {
      const alertMessage = req.flash('alertMessage');
      const alertStatus = req.flash('alertStatus');
      const alert = { message: alertMessage, status: alertStatus };

      const intern = await Intern.find().sort({ createdAt: -1 });

      res.render(`${urlpath}/view_logbook`, {
        title: 'Laporan Kegiatan',
        status: false,
        intern,
        alert
      })
    } catch (err) {
      req.flash('alertMessage', `${err.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/logbook')
    }
  },
  viewLogbook: async (req, res) => {
    try {
      const { id } = req.query;

      const logbook = await Logbook.find({ intern: id }).populate('intern');
      const intern = await Intern.find().sort({ createdAt: -1 });
      const profile = await Placement.findOne({ intern: id }).populate('biro').populate('intern').populate('supervisor');


      // req.flash('alertMessage', 'Berhasil Menambah Bidang Kegiatan');
      // req.flash('alertStatus', 'success');

      res.render(`${urlpath}/view_logbook`, {
        title: 'Laporan Kegiatan',
        intern,
        logbook,
        profile,
        status: true,
        dateFormatCertificate,
      });
    } catch (err) {
      req.flash('alertMessage', `${err.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/logbook')
    }
  },

  // APIs
  createLogbook: async (req, res) => {
    try {
      console.log(req.user);
      if (req.user.role !== 'intern') {
        return res.status(401).json({ error: 'Not authorized to access this resource' });
      }

      const { activity, description, date } = req.body;
      if (!activity) return res.status(422).json({
        errors: {
          message: ['aktifitas harus diisi'],
          field: 'activity'
        }
      })
      if (!description) return res.status(422).json({
        errors: {
          message: ['deskripsi aktifitas harus diisi'],
          field: 'description'
        }
      })
      if (!date) return res.status(422).json({
        errors: {
          message: ['tanggal aktifitas dilakukan harus diisi'],
          field: 'date'
        }
      })
      const logbook = new Logbook({
        activity,
        description,
        date: Date.parse(date),
        intern: req.user.id,
      })

      await logbook.save();
      res.status(201).json({
        data: logbook,
      })

    } catch (err) {
      console.log(err);
      res.status(500).json({
        errors: {
          message: [
            err.message || "terjadi kesalahan pada server"
          ],
        }
      })
    }
  },
  getAllLogbook: async (req, res) => {
    try {
      const { role } = req.user;
      const { intern } = req.query;

      if (role === 'intern') {
        const { id } = req.user;
        const data = await Logbook.find({ intern: id });
        return res.status(200).json({
          data: data,
        })
      } else if (role === 'supervisor') {
        const data = await Placement.aggregate([
          {
            $match: {
              supervisor: new mongoose.Types.ObjectId(req.user.id)
            }
          },
          {
            $lookup: {
              from: 'interns',
              localField: 'intern',
              foreignField: '_id',
              pipeline: [
                {
                  $lookup: {
                    from: 'logbooks',
                    localField: '_id',
                    foreignField: 'intern',
                    pipeline: [
                      { $sort: { date: -1 } },
                      // { $match: { status: 'pending' } }
                    ],
                    as: 'logbook'
                  }
                }
              ],
              as: 'intern'
            }
          }
        ]);

        return res.status(200).json({
          data: data
        })
      } else {
        const logbook = await Logbook.find({ intern: intern })
          .sort({ createdAt: -1 });

        const interns = await Intern.findOne({ _id: intern })

        return res.status(200).json({
          data: { logbook, interns }
        })
      }
    } catch (err) {
      console.log(err);
      res.status(404).json({
        errors: {
          message: [
            err.message || "Data tidak ditemukan"
          ],
        }
      })
    }
  },
  getLogbookById: async (req, res) => {
    try {
      const { id } = req.params;
      const logbook = await Logbook.findOne({ _id: id }).populate('intern');
      res.status(200).json({
        data: logbook,
      })
    } catch (err) {
      console.log(err);
      res.status(404).json({
        errors: {
          message: [
            err.message || "Data tidak ditemukan"
          ],
        }
      })
    }
  },
  acceptLogbook: async (req, res) => {
    try {
      if (req.user.role !== 'supervisor') {
        return res.status(401).json({ error: 'Not authorized to access this resource' });
      }
      const { id } = req.params;
      const { comment, status } = req.body;

      const logbook = await Logbook.findOne({ _id: id });

      logbook.status = status;
      logbook.comment.unshift(comment);
      const logbookSave = await logbook.save();

      // const logbook = await Logbook.findOneAndUpdate(
      //   { _id: id },
      //   {
      //     comment,
      //     status
      //   }, { new: true });

      res.status(201).json({
        data: logbookSave,
      })
    } catch (err) {
      console.log(err);
      res.status(500).json({
        errors: {
          message: [
            err.message || "terjadi kesalahan pada server"
          ],
        }
      })
    }
  },
  updateLogbook: async (req, res) => {
    try {
      const { id } = req.params;

      const { activity, description, date } = req.body;
      if (!activity) return res.status(422).json({
        errors: {
          message: ['aktifitas harus diisi'],
          field: 'activity'
        }
      })
      if (!description) return res.status(422).json({
        errors: {
          message: ['deskripsi aktifitas harus diisi'],
          field: 'description'
        }
      })
      if (!date) return res.status(422).json({
        errors: {
          message: ['tanggal aktifitas dilakukan harus diisi'],
          field: 'date'
        }
      })

      const logbook = await Logbook.findOneAndUpdate({ _id: id },
        {
          activity,
          description,
          date: Date.parse(date),
        }, { new: true });

      res.status(201).json({
        data: logbook,
      })
    } catch (err) {
      console.log(err);
      res.status(500).json({
        errors: {
          message: [
            err.message || "terjadi kesalahan pada server"
          ],
        }
      })
    }
  },
  deleteLogbook: async (req, res) => {
    try {
      const { id } = req.params;
      const logbook = await Logbook.findOneAndRemove({ _id: id });

      res.status(200).json({
        data: {
          message: [
            'data berhasil dihapus'
          ],
        }
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        errors: {
          message: [
            err.message || "terjadi kesalahan pada server"
          ],
        }
      })
    }
  }
};