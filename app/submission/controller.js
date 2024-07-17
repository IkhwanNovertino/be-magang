const path = require('path');
const fs = require('fs');
const config = require('../../config');
const Submission = require('./model');
const { dateFormat } = require('../../utils')

const urlpath = 'admin/submission';

module.exports = {
  index: async (req, res) => {
    try {
      const alertMessage = req.flash('alertMessage');
      const alertStatus = req.flash('alertStatus');
      const alert = { message: alertMessage, status: alertStatus };

      const submission = await Submission.find().populate('applicant');
      console.log(submission);
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
      const { id } = req.params;
      const submission = await Submission.findById(id).populate('applicant');

      res.render(`${urlpath}/detail`, {
        title: 'Detail Pengajuan Magang',
        submission,
        dateFormat
      })
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
      let file_path = path.resolve(config.rootPath, `public/offering-letter`, file.offering_letter);

      res.set('Content-Disposition', `attachment; filename="${file.offering_letter}"`);
      res.download(file_path, file.offering_letter, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log('file successfully downloading');
        }
      })
    } catch (err) {
      console.log(err);
      req.flash('alertMessage', `${err.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect(`/submission`)
    }
  },
  // API
  saveSubmission: async (req, res) => {
    try {
      const { doc_institute, doc_number, doc_date,
        start_an_internship, end_an_internship,
        offering_letter, vacancy, candidates } = req.body;

      const res_candidates = typeof candidates === 'string' ? JSON.parse(candidates) : candidates;

      const payload = {
        applicant: req.user.id,
        doc_institute: doc_institute,
        doc_number: doc_number,
        doc_date: Date.parse(doc_date),
        start_an_internship: Date.parse(start_an_internship),
        end_an_internship: Date.parse(end_an_internship),
        vacancy: vacancy,
        candidates: res_candidates,
      };
      console.log('Data Payload controller saveSubmission');
      console.log(payload);

      if (req.file) {
        console.log(req.file);
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
            console.log('log data sebelum di save ke database');
            console.log(submission);
            await submission.save();
            console.log('DATATATAAAA');
            return res.status(201).json({
              data: {
                submission
              }
            })
          } catch (err) {
            console.log('ERRR di Stream');
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
      res.status(500).json({ message: err.message || 'Terjadi kesalahan pada server' });
    }
  },
}
