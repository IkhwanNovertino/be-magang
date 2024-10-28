const path = require('path');
const fs = require('fs');
const config = require('../../config');
const Submission = require('../submission/model');

const urlpath = 'admin/submission';

module.exports = {
  downloadFileSubmission: async (req, res) => {
    try {
      const { file } = req.params;
      let file_path;

      if (req.url.includes('offering')) {
        const res_doc = await Submission.findOne({ offering_letter: file });
        if (!res_doc) return res.status(404).json({
          errors: {
            message: ['Data surat pengajuan magang tidak ditemukan']
          }
        })

        file_path = path.resolve(config.rootPath, config.urlUploads, file);
      }

      if (req.url.includes('acceptance')) {
        const res_doc = await Submission.findOne({ acceptance_letter: file });
        if (!res_doc) return res.status(404).json({
          errors: {
            message: ['Data surat persetujuan magang tidak ditemukan']
          }
        })

        file_path = path.resolve(config.rootPath, config.urlUploads, file);
      }

      res.set('Content-Disposition', `attachment; filename="${file}"`);
      res.download(file_path, file)

    } catch (err) {
      console.log(err);
      return res.status(400).json({
        errors: {
          message: message,
          fields: err.errors,
        }
      });
    }
  },
}
