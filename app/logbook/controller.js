const Logbook = require('./model');

const urlpath = 'admin/intern';

module.exports = {
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