const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const HASH_ROUND = 16;

let authSchema = mongoose.Schema({
  username: {
    type: String,
    require: [true, 'username harus diisi.']
  },
  password: {
    type: String,
    require: [true, 'Password harus diisi'],
    maxLength: [225, 'panjang password harus antara 4 - 225 karakter'],
    minLength: [4, 'panjang password harus antara 4 - 225 karakter'],
  },
  role: {
    type: String,
    enum: ['supervisor', 'umpeg', 'pembina', 'applicant', 'peserta'],
    default: 'applicant'
  },
  status: {
    type: String,
    enum: ['Y', 'N'],
    default: 'Y'
  },
}, { timestamps: true })

authSchema.path('username').validate(async function (value) {
  try {
    const count = await this.model('Auth').countDocuments({ username: value });
    return !count;
  } catch (err) {
    throw err
  }
}, attr => `${attr.value} sudah terdaftar`);

authSchema.pre('save', function (next) {
  this.password = bcrypt.hashSync(this.password, HASH_ROUND);
  next();
})

module.exports = mongoose.model('Auth', authSchema);
// module.exports = mongoose.model('Applicant', applicantSchema);