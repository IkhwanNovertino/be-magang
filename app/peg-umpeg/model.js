const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const HASH_ROUND = 16;

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
  email: {
    type: String,
    match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g, `Email tidak valid`],
    default: 'default@email.com'
  },
  phone_num: {
    type: Number,
    default: 1
  },
  photo_profile: {
    type: String,
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

peg_umpegSchema.path('nip').validate(async function (value) {
  try {
    const count = await this.model('Peg_umpeg').countDocuments({ nip: value });
    return !count;
  } catch (err) {
    throw err;
  }
}, attr => `${attr.value} sudah ada`);

peg_umpegSchema.pre('save', function (next) {
  this.password = bcrypt.hashSync(this.password, HASH_ROUND);
  next();
});

module.exports = mongoose.model('Peg_umpeg', peg_umpegSchema);