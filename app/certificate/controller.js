const Certificate = require('./model');
const Evaluation = require('../evaluation/model');
const Intern = require('../intern/model');
const Pembina = require('../pembina/model');
const moment = require('moment');

const urlpath = 'admin/certificate';

const duration = (a, b) => {
  moment.locale('id');
  const tglmulai = moment(a);
  const tglselesai = moment(b);
  let diff = tglselesai.from(tglmulai)
  const getDuration = diff.slice(6);

  return getDuration;

}

module.exports = {
  index: async (req, res) => {
    try {
      res.render(`${urlpath}/template`, {
        title: 'Sertifikat',
      })
    } catch (error) {
      console.log(error);
      res.redirect('/')
    }
  },
  createCertificate: async (req, res) => {
    try {
      // if (req.user.role !== 'supervisor') {
      //   return res.status(403).json({
      //     errors: {
      //       message: [
      //         'Not allowed to access this resource',
      //       ],
      //     }
      //   });
      // }

      const { intern, evaluation } = req.body;

      const res_intern = await Intern.findOne({ _id: intern })
      if (!res_intern) return res.status(404).json({
        message: [
          'data peserta magang tidak ditemukan',
        ],
      });

      const res_evaluation = await Evaluation.findOne({ _id: evaluation }).populate('score.title');
      if (!res_evaluation) return res.status(404).json({
        message: [
          'data nilai peserta magang tidak ditemukan',
        ],
      });


      let scoreNT = [];
      let scoreT = [];
      let total = 0;
      res_evaluation.score.forEach(items => {
        if (items.title.category === 'NT') {
          scoreNT.push({
            title: items.title.title,
            category: items.title.category,
            grade_number: items.number,
            grade_string: (items.number >= 90 && 'A') || (items.number >= 80 && 'B') ||
              (items.number >= 70 && 'C') || (items.number <= 69 && 'D'),
          })
        } else {
          scoreT.push({
            title: items.title.title,
            category: items.title.category,
            grade_number: items.number,
            grade_string: (items.number >= 90 && 'A') || (items.number >= 80 && 'B') ||
              (items.number >= 70 && 'C') || (items.number <= 69 && 'D'),
          })
        }
        total += items.number;
      })
      const scoreMean = total / res_evaluation.score.length;

      console.log(duration(res_intern.start_an_internship, res_intern.end_an_internship));


      const payload = {
        historyIntern: {
          name: res_intern.name,
          start_an_internship: res_intern.start_an_internship,
          end_an_internship: res_intern.end_an_internship,
          major: res_intern.major,
          duration_internship: duration(res_intern.start_an_internship, res_intern.end_an_internship),
        },
        historyEvaluation: {
          category_score: [
            {
              name: 'NT',
              score: scoreNT,
            },
            {
              name: 'T',
              score: scoreT,
            },
          ],
          total: {
            total_number: total,
            mean: scoreMean.toPrecision(4),
            total_string: (scoreMean >= 90 && 'A') || (scoreMean >= 80 && 'B') ||
              (scoreMean >= 70 && 'C') || (scoreMean <= 69 && 'D'),
          },
        },
        historyPembina: {
          name: '',
          nip: '',
          position: '',
          pangkat: '',
        },
        publish_date: Date.now(),
        result: ((scoreMean >= 90 && 'Sangat Baik') || (scoreMean >= 80 && 'Baik') ||
          (scoreMean >= 70 && 'Cukup Baik') || (scoreMean <= 69 && 'Kurang Baik')
        ),
        intern: intern,
        evaluation: evaluation,
      };
      if (res_evaluation.evaluateId < 10) {
        payload.certif_num = `13/00${res_evaluation.evaluateId}/SRT/INFO/KOMINFO`
      } else {
        payload.certif_num = `13/0${res_evaluation.evaluateId}/SRT/INFO/KOMINFO`
      }

      const certificate = new Certificate({ ...payload });

      await Evaluation.findOneAndUpdate(
        { _id: evaluation },
        {
          status: 'success',
        }, { new: true })

      await certificate.save();

      res.status(201).json({
        data: certificate
      })
    } catch (err) {
      console.log(`ERRRR di createEvaluation >>> ${err}`);
      if (err && err.name === 'ValidationError') {
        return res.status(400).json({
          errors: {
            message: [err.message],
            fields: err.errors,
          }
        });
      }
      res.status(400).json({
        errors: {
          message: [
            err.message || 'Terjadi masalah pada server',
          ],
        },
      })
    }
  },
  acceptanceCertificate: async (req, res) => {
    try {
      if (req.user.role !== 'pembina') {
        return res.status(403).json({
          errors: {
            message: [
              'Not allowed to access this resource',
            ],
          }
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

      const evaluate = await Evaluation.findOneAndUpdate(
        { _id: evaluation },
        {
          status: 'accept'
        }, { new: true }
      );

      const certificate = new Certificate({ ...payload });
      await certificate.save();

      const internStatusUpdate = await Intern.findOneAndUpdate(
        { _id: intern },
        {
          statusIntern: 'finish',
        },
        { new: true })

      res.status(201).json({
        data: certificate
      })
    } catch (err) {
      console.log(`ERRRR di createEvaluation >>> ${err}`);
      if (err && err.name === 'ValidationError') {
        return res.status(400).json({
          errors: {
            message: [err.message],
            fields: err.errors,
          }
        });
      }
      res.status(400).json({
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