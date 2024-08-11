const Certificate = require('./model');
const Evaluation = require('../evaluation/model');
const Intern = require('../intern/model');
const { populate } = require('dotenv');

module.exports = {
  createCertificate: async (req, res) => {
    try {
      if (req.user.role !== 'pembina') {
        return res.status(401).json({
          message: [
            'Not authorized to access this resource',
          ],
        });
      }

      const { intern, evaluation } = req.body;

      const res_intern = await Intern.findOne({ _id: intern })
      if (!res_intern) return res.status(404).json({
        message: [
          'data peserta magang tidak ditemukan',
        ],
      });

      const res_evaluation = await Evaluation.findOne({ _id: evaluation });
      if (!res_evaluation) return res.status(404).json({
        message: [
          'data nilai peserta magang tidak ditemukan',
        ],
      });

      console.log(res_evaluation);

      const payload = {
        intern: intern,
        evaluation: evaluation,
        pembina: req.user.id,
        publish_date: Date.now(),
      };
      if (res_evaluation.evaluateId < 10) {
        payload.certif_num = `13/00${res_evaluation.evaluateId}/SRT/INFO/KOMINFO`
      } else {
        payload.certif_num = `13/0${res_evaluation.evaluateId}/SRT/INFO/KOMINFO`
      }
      console.log(payload);
      const evaluate = await Evaluation.findOneAndUpdate(
        { _id: evaluation },
        {
          status: 'accept'
        }, { new: true }
      );

      const certificate = new Certificate({ ...payload });
      console.log(certificate);

      await certificate.save();

      res.status(201).json({
        data: certificate
      })
    } catch (err) {
      console.log(`ERRRR di createEvaluation >>> ${err}`);
      if (err && err.name === 'ValidationError') {
        // const message = [];
        // if (err.errors.intern) message.push(err.errors.title.message);
        // if (err.errors.category) message.push(err.errors.category.message);

        return res.status(422).json({
          message: err.message,
          fields: err.errors,
        });
      }
      res.status(500).json({
        errors: {
          message: [
            err.message || 'Terjadi masalah pada server',
          ],
        },
      })
    }
  },
  getCertificateById: async (req, res) => {
    try {
      const { id } = req.params;

      const certificate = await Certificate.findOne({ _id: id })
        .populate('intern')
        .populate('pembina')
        .populate({
          path: 'evaluation',
          populate: { path: 'score.title' },
        })

      if (!certificate) throw new Error

      res.status(200).json({
        data: certificate,
      });

    } catch (err) {
      res.status(404).json({
        errors: {
          message: [
            'sertifikat tidak ditemukan',
          ],
        },
      })
    }
  }
}