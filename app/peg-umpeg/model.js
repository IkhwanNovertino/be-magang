const mongoose = require('mongoose');

let peg_umpegSchema = mongoose.Schema({
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
  contact: {
    email: {
      type: String,
    },
    phone_num: {
      type: Number,
    }
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

module.exports = mongoose.model('Peg_umpeg', peg_umpegSchema);