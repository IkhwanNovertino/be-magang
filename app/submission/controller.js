const path = require('path');
const fs = require('fs');
const config = require('../../config');
const Submission = require('./model');
const Vacancy = require('../vacancy/model');
const Intern = require('../intern/model');
const { dateFormat } = require('../../utils')

const urlpath = 'admin/submission';

module.exports = {
  index: async (req, res) => {
    try {
      const alertMessage = req.flash('alertMessage');
      const alertStatus = req.flash('alertStatus');
      const alert = { message: alertMessage, status: alertStatus };

      const submission = await Submission.find().populate('applicant');
      res.render(`${urlpath}/view_submission`, {
        title: 'Pengajuan Magang',
        submission,
        alert
      })
    } catch (err) {
      req.flash('alertMessage', `${err.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/submission')
    }
  },
  viewDetail: async (req, res) => {
    try {
      const alertMessage = req.flash('alertMessage');
      const alertStatus = req.flash('alertStatus');
      const alert = { message: alertMessage, status: alertStatus };

      const { id } = req.params;
      const submission = await Submission.findById(id).populate('applicant');

      res.render(`${urlpath}/detail`, {
        title: 'Detail Pengajuan Magang',
        submission,
        dateFormat,
        alert
      })
    } catch (err) {
      req.flash('alertMessage', `${err.message}`);
      req.flash('alertStatus', 'danger');

      res.redirect('/submission')
    }
  },
  createIntern: async (req, res) => {
    try {
      const { idSubmission, name, nim, major, levels } = req.body;
      const submission = await Submission.findOne({ _id: idSubmission });

      const payload = {
        name: name,
        id_num: nim,
        password: nim,
        institute: submission.doc_institute,
        major: major,
        levels: levels,
        start_an_internship: submission.start_an_internship,
        end_an_internship: submission.end_an_internship,
        submissionID: idSubmission,
      };

      const intern = new Intern({ ...payload });
      await intern.save()

      req.flash('alertMessage', 'Berhasil Menambah Peserta Magang');
      req.flash('alertStatus', 'success');
      res.redirect(`/submission/detail/${idSubmission}`);
    } catch (err) {
      req.flash('alertMessage', `${err.message}`);
      req.flash('alertStatus', 'danger');

      res.redirect('/submission')
    }
  },
  downloadFile: async (req, res) => {
    try {
      const { id } = req.params
      const file = await Submission.findById(id);
      if (req.query.letter === 'offering') {
        const file_path = path.resolve(config.rootPath, `public/offering-letter`, file.offering_letter);

        res.set('Content-Disposition', `attachment; filename="${file.offering_letter}"`);
        res.download(file_path, file.offering_letter)
      } else {
        const file_path = path.resolve(config.rootPath, `public/acceptance-letter`, file.acceptance_letter);

        res.set('Content-Disposition', `attachment; filename="${file.acceptance_letter}"`);
        res.download(file_path, file.acceptance_letter)
      }

    } catch (err) {
      console.log(err);
      req.flash('alertMessage', `${err.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect(`/submission`)
    }
  },
  getAllSubmission: async (req, res) => {
    try {
      const role = req.user.role;
      if (role === 'applicant') {
        const { id } = req.user;
        const submission = await Submission.find({ applicant: id });
        return res.status(200).json({
          data: {
            submission
          }
        });
      } else {
        let payload = {};
        const submission = await Submission.find().populate('applicant');
        let vacant = submission.vacancy !== '1' ? await Vacancy.findOne({ _id: submission.vacancy }) : submission.vacancy;

        payload = {
          submission,
          vacant,
        };

        return res.status(200).json({
          data: {
            payload,
          }
        })
      }
    } catch (err) {
      return res.status(500).json({ message: err.message || 'Terjadi kesalahan pada server' });
    }
  },
  getSubmissionById: async (req, res) => {
    try {
      const { id } = req.params;
      const submission = await Submission.findOne({ _id: id });
      return res.status(200).json({
        data: {
          submission,
        }
      })
    } catch (err) {
      return res.status(500).json({ message: err.message || 'Terjadi kesalahan pada server' });
    }
  },
  saveSubmission: async (req, res) => {
    try {
      const { doc_institute, doc_number, doc_date,
        start_an_internship, end_an_internship,
        vacancy, candidates } = req.body;

      const res_candidates = typeof candidates === 'string' ? JSON.parse(candidates) : candidates;
      const res_vancant = vacancy !== '1' ? await Vacancy.findOne({ _id: vacancy }) : vacancy;

      let payload = {
        applicant: req.user.id,
        doc_institute: doc_institute,
        doc_number: doc_number,
        doc_date: Date.parse(doc_date),
        start_an_internship: Date.parse(start_an_internship),
        end_an_internship: Date.parse(end_an_internship),
        candidates: res_candidates,
        type_of_submission: vacancy === '1' ? 'mandiri' : 'lowongan',
        historyVacancy: {
          id: res_vancant?.id ? res_vancant.id : '1',
          position: res_vancant?.position ? res_vancant.position : '',
          duration: res_vancant?.duration ? res_vancant.duration : '',
        }
      };

      if (req.file) {
        let tmp_path = req.file.path;
        let originalExt = req.file.originalname.split('.')[req.file.originalname.split('.').length - 1];
        let filename = req.file.filename + '.' + originalExt;
        let target_path = path.resolve(config.rootPath, `public/offering-letter/${filename}`);

        const src = fs.createReadStream(tmp_path);
        const dest = fs.createWriteStream(target_path);

        src.pipe(dest);
        src.on('end', async () => {
          try {
            const submission = new Submission({ ...payload, offering_letter: filename });
            await submission.save();

            return res.status(201).json({
              data: {
                submission
              }
            })
          } catch (err) {
            if (err && err.name === "ValidationError") {
              const message = [];
              if (err.errors.doc_institute) message.push(err.errors.doc_institute.message);
              if (err.errors.doc_number) message.push(err.errors.doc_number.message);
              if (err.errors.doc_date) message.push(err.errors.doc_date.message);
              if (err.errors.start_an_internship) message.push(err.errors.start_an_internship.message);
              if (err.errors.end_an_internship) message.push(err.errors.end_an_internship.message);
              if (err.errors.offering_letter) message.push(err.errors.offering_letter.message);

              return res.status(422).json({
                message: message,
                fields: err.errors,
              });
            }
          }
        });
      }
    } catch (err) {
      res.status(500).json({ errors: err.errors });
    }
  },
  setSubmissionStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.query;

      const submission = await Submission.findOneAndUpdate({ _id: id }, { status }, { new: true, runValidators: true });

      return res.status(200).json({
        data: {
          submission
        }
      })
    } catch (err) {
      return res.status(500).json({ message: err.message || 'Terjadi kesalahan pada server' });
    }
  },
  setSubmmissionSuccess: async (req, res) => {
    try {
      const { id } = req.params;
      if (req.file) {
        let tmp_path = req.file.path;
        let originalExt = req.file.originalname.split('.')[req.file.originalname.split('.').length - 1];
        let filename = req.file.filename + '.' + originalExt;
        let target_path = path.resolve(config.rootPath, `public/acceptance-letter/${filename}`);

        const src = fs.createReadStream(tmp_path);
        const dest = fs.createWriteStream(target_path);

        src.pipe(dest);
        src.on('end', async () => {
          try {
            const submission = await Submission.findOneAndUpdate(
              { _id: id },
              {
                acceptance_letter: filename,
                status: 'success'
              }, { new: true, runValidators: true });
            return res.status(201).json({
              data: {
                submission
              }
            })
          } catch (err) {
            if (err && err.name === "ValidationError") {
              const message = [];
              if (err.errors.acceptance_letter) message.push(err.errors.acceptance_letter.message);
              if (err.errors.status) message.push(err.errors.status.message);

              return res.status(422).json({
                message: message,
                fields: err.errors,
              });
            }
          }
        })
      } else {
        return res.status(422).json({
          message: ['Surat balasan pengajuan magang tidak boleh kosong'],
          fields: 'acceptance_letter',
        });
      }
    } catch (err) {
      return res.status(500).json({ message: err.message || 'Terjadi kesalahan pada server' });
    }
  },
  actionDelete: async (req, res) => {
    try {
      const { id } = req.params;

      const submission = await Submission.findOneAndRemove({
        _id: id
      });

      let currentFile = `${config.rootPath}/public/offering-letter/${submission.offering_letter}`;
      if (fs.existsSync(currentFile)) {
        fs.unlinkSync(currentFile)
      }

      res.status(200).json({
        data: {
          message: [
            'data berhasil dihapus'
          ],
        }
      });
    } catch (err) {
      return res.status(500).json({ message: err.message || 'Terjadi kesalahan pada server' });
    }
  },
}
