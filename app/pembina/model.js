const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const HASH_ROUND = 16;

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
  pangkat: {
    type: String,
    require: [true, 'Pangkat harus diisi']
  },
  golongan: {
    type: String,
    require: [true, 'Golongan harus diisi']
  },
  avatar: {
    type: String,
    default: "none"
  },
  password: {
    type: String,
    require: [true, 'password harus diisi']
  },
  status: {
    type: String,
    enum: ['Y', 'N'],
    default: 'N'
  },
}, { timestamps: true })

pembinaSchema.path('nip').validate(async function (value) {
  try {
    const count = await this.model('Pembina').countDocuments({ nip: value });
    return !count;
  } catch (err) {
    throw err;
  }
}, attr => `${attr.value} sudah ada`);

pembinaSchema.pre('save', function (next) {
  this.password = bcrypt.hashSync(this.password, HASH_ROUND);
  next();
});

module.exports = mongoose.model('Pembina', pembinaSchema);