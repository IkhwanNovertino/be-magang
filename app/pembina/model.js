const mongoose = require('mongoose');

let pembinaSchema = mongoose.Schema({
  name: {
    type: String,
    require: [true, "Nama bidang kegiatan harus diisi"]
  },
  nip: {
    type: String,
    require: [true, 'No. Induk Pegawai harus diisi']
  },
  job_title: {
    type: String,
    require: [true, 'Jabatan harus diisi']
  },
  photo_profile: {
    type: String,
  },
  username: {
    type: String,
    require: [true, 'username harus diisi'],
  },
  password: {
    type: String,
    require: [true, 'password harus diisi']
  },
  status: {
    type: String,
    enum: ['Y', 'N'],
    default: 'Y'
  },
}, { timestamps: true })

module.exports = mongoose.model('Pembina', pembinaSchema);