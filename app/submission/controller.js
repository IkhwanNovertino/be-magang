const path = require('path');
const fs = require('fs');
const config = require('../../config');
const Submission = require('./model');

module.exports = {

  

  saveSubmission: async (req, res) => {
    try {
      const { doc_institute, doc_number, doc_date,
        start_an_internship, end_an_internship,
        offering_letter, vacancy, candidates } = req.body;

      // const res_vacancy = vacancy !== 1 ?
      //   await vancant.findOne({ _id: vacancy }) :
      //   vacancy;
      const res_candidates = typeof candidates === 'string' ? JSON.parse(candidates) : candidates;

      const payload = {
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
