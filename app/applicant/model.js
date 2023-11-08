const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const hashRound = 12

let applicantSchema = mongoose.Schema({
  name: {
    type: String,
    require: [true, "Nama harus diisi"],
    minLength: [3, 'panjang nama harus antara 3 - 225 karakter'],
    maxLength: [225, 'panjang nama harus antara 3 - 225 karakter'],
  },
  institute: {
    type: String,
    require: [true, "Sekolah/Kampus harus diisi"]
  },
  username: {
    type: String,
    require: [true, "username harus diisi"],
    minLength: [3, 'panjang nama harus antara 3 - 225 karakter'],
    maxLength: [225, 'panjang nama harus antara 3 - 225 karakter'],
  },
  password: {
    type: String,
    require: [true, "password harus diisi"]
  },
  email: {
    type: String
  },
  phone_num: {
    type: Number,
    default: 1
  },
  avatar: {
    type: String,
    default: 'no avatar'
  },
  status: {
    type: String,
    enum: ['Y', 'N'],
    default: 'Y'
  }
}, { timestamps: true })

//untuk menvalidasi apakah ada username yg sama
applicantSchema.path('username').validate(async function (value) {
  try {
    const count = await this.model('Applicant').countDocuments({ username: value })
    return !count;
  } catch (err) {
    throw err
  }
}, attr => `${attr.value} sudah terdaftar`)

//untuk menvalidasi apakah ada email yg sama
applicantSchema.path('email').validate(async function (value) {
  try {
    const count = await this.model('Applicant').countDocuments({ email: value })
    return !count;
  } catch (err) {
    throw err
  }
}, attr => `${attr.value} sudah terdaftar`)

//untuk membuat passwordnya di hash
applicantSchema.pre('save', function (next) {
  this.password = bcrypt.hashSync(this.password, hashRound);
  next();
})

module.exports = mongoose.model('Applicant', applicantSchema);