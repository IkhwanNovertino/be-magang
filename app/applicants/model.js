const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const HASH_ROUND = 16;

let applicantSchema = mongoose.Schema({
  name: {
    type: String,
    minLength: [3, 'Nama Lengkap harus antara 3 - 225 karakter'],
    maxLength: [225, 'Nama Lengkap harus antara 3 - 225 karakter'],
    require: [true, "Nama pemohon harus diisi"],
  },
  institute: {
    type: String,
    minLength: [3, 'Institusi harus antara 3 - 225 karakter'],
    maxLength: [225, 'Institusi harus antara 3 - 225 karakter'],
    require: [true, "Institusi harus diisi"],
  },
  email: {
    type: String,
    match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g, `Email tidak valid`],
    require: [true, "email harus diisi"],
  },
  phone_num: {
    type: Number,
    default: 1,
  },
  avatar: {
    type: String,
    default: "none"
  },
  password: {
    type: String,
    require: [true, 'Password harus diisi'],
    maxLength: [225, 'panjang password harus antara 4 - 225 karakter'],
    minLength: [4, 'panjang password harus antara 4 - 225 karakter'],
  },
  status: {
    type: String,
    enum: ['Y', 'N'],
    default: 'Y'
  },
}, { timestamps: true })

applicantSchema.path('email').validate(async function (value) {
  try {
    const count = await this.model('Applicant').countDocuments({ email: value });
    return !count;
  } catch (err) {
    throw err;
  }
}, attr => `${attr.value} sudah terdaftar`);

// applicantSchema.path('email').validate(async function (value) {
//   try {
//     const 
//   } catch (err) {
//     throw err;
//   }
// })

applicantSchema.pre('save', function (next) {
  this.password = bcrypt.hashSync(this.password, HASH_ROUND);
  next();
})

module.exports = mongoose.model('Applicant', applicantSchema);