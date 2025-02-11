const Certificate = require('./model');
const Evaluation = require('../evaluation/model');
const Intern = require('../intern/model');
const Pembina = require('../pembina/model');
const Placement = require('../placement/model');
const moment = require('moment');
const path = require('path');
const config = require('../../config');

const { generateCertificate, dateFormatCertificate } = require('../../utils');
// const { config } = require('dotenv');

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
      console.log(req.url);
      const interns = await Intern.find().sort({ createdAt: -1 });

      res.render(`${urlpath}/view_certificate`, {
        title: 'Sertifikat',
        interns,
        status: false
      })
    } catch (error) {
      console.log(error);
      res.redirect('/')
    }
  },
  viewCertificate: async (req, res) => {
    try {
      const { id } = req.query;
      const profile = await Placement.findOne({ intern: id }).populate('biro').populate('intern').populate('supervisor');
      const interns = await Intern.find().sort({ createdAt: -1 });
      const certificate = await Certificate.findOne({ intern: id });

      res.render(`${urlpath}/view_certificate`, {
        title: 'Sertifikat',
        interns,
        profile,
        certificate,
        intern: certificate.historyIntern,
        certif_num: certificate.certif_num,
        pembina: certificate.historyPembina,
        result: certificate.result,
        publish_date: certificate.publish_date,
        scoreTotal: certificate.historyEvaluation.total,
        score: certificate.historyEvaluation.category_score,
        status: true,
        dateFormatCertificate,
      });
    } catch (err) {
      console.log(err);
      res.redirect('/')
    }
  },
  downloadFileCertificate: async (req, res) => {
    try {
      const { file } = req.params;
      const file_path = path.resolve(config.rootPath, config.urlUploads, `${file}.pdf`);

      res.set('Content-Disposition', `attachment; filename="${file}.pdf"`);
      res.download(file_path, `${file}.pdf`)
    } catch (err) {
      console.log(err);
      res.redirect('/')
    }
  },
  template: async (req, res) => {
    try {
      const { uid } = req.query;
      const certificate = await Certificate.findOne({ _id: uid });

      res.render(`${urlpath}/template`, {
        title: 'Format Sertifikat',
        intern: certificate.historyIntern,
        certif_num: certificate.certif_num,
        pembina: certificate.historyPembina,
        result: certificate.result,
        publish_date: certificate.publish_date,
        scoreTotal: certificate.historyEvaluation.total,
        score: certificate.historyEvaluation.category_score,
        dateFormatCertificate,
      })

    } catch (err) {

    }
  },

  // APIs
  createCertificate: async (req, res) => {
    try {
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
  approveCertificate: async (req, res) => {
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

      const { intern } = req.params;

      const res_intern = await Intern.findOne({ _id: intern })
      if (!res_intern) throw new Error('data peserta magang tidak ditemukan')

      const res_evaluation = await Evaluation.findOne({ intern: intern });
      if (!res_evaluation) throw new Error('data nilai peserta magang tidak ditemukan')

      // update historyPembina && update status certificate
      const pembina = await Pembina.findOne({ _id: req.user.id });
      const certificate = await Certificate.findOneAndUpdate(
        { intern: intern },
        {
          historyPembina: {
            name: pembina.name,
            nip: pembina.nip,
            position: pembina.job_title,
            pangkat: pembina.pangkat,
          },
          status: 'success',
          publish_date: Date.now(),
        },
        { new: true }
      );



      // buat func generate-certificate dan generate qrcode;
      // qrcode

      // const pathTemplate = path.resolve(config.rootPath, `/views/admin/certificate/template.ejs`);
      // const outputPath = path.resolve(config.rootPath, `/${config.urlUploads}/${certificate._id}`);
      console.log('start generate certificate from approveCertificate');

      const generate = await generateCertificate(certificate);

      console.log(generate);

      // update statusIntern di intern
      await Intern.findOneAndUpdate(
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