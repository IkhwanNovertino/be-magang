const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const HASH_ROUND = 16;

let internSchema = mongoose.Schema({
  name: {
    type: String,
    require: [true, 'Nama peserta magang harus diisi'],
  },
  id_num: {
    type: String,
    require: [true, 'Nomor Induk Siswa/Mahasiswa/Pegawai harus diisi']
  },
  password: {
    type: String,
    require: [true, 'Password harus diisi']
  },
  institute: {
    type: String,
    require: [true, 'Asal Sekolah/Kampus/Instansi harus diisi'],
  },
  major: {
    type: String,
    require: [true, 'Jurusan harus diisi'],
  },
  levels: {
    type: String,
    enum: ['slta', 'college', 'employee'],
    default: 'college',
  },
  start_an_internship: {
    type: Number,
    require: [true, 'Tanggal mulai magang harus diisi'],
  },
  end_an_internship: {
    type: Number,
    require: [true, 'Tanggal selesai magang harus diisi'],
  },
  email: {
    type: String,
    match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g, `Email tidak valid`],
    default: 'email@default.com'
  },
  phone_num: {
    type: Number,
    default: 1
  },
  avatar: {
    type: String,
    default: "none"
  },
  statusIntern: {
    type: String,
    enum: ['pending', 'active', 'finish'],
    default: 'pending',
  },
  status: {
    type: String,
    enum: ['Y', 'N'],
    default: 'N'
  },
  submissionID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Submission',
  }
}, { timestamps: true })

internSchema.path('id_num').validate(async function (value) {
  try {
    const count = await this.model('Intern').countDocuments({ id_num: value });
    return !count;
  } catch (err) {
    throw err;
  }
}, attr => `${attr.value} sudah terdaftar`);

internSchema.pre('save', function (next) {
  this.password = bcrypt.hashSync(this.password, HASH_ROUND);
  next();
});

module.exports = mongoose.model('Intern', internSchema);