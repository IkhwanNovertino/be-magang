const mongoose = require('mongoose');

let vacancySchema = mongoose.Schema({
  position: {
    type: String,
    require: [true, "Posisi magang harus diisi"]
  },
  job_desc: {
    type: String,
    require: [true, 'Deskripsi pekerjaan harus diisi']
  },
  requirement: [{
    type: String,
    default: 'Mampu bekerja sama dalam tim'
  }],
  duration: {
    type: String,
    require: [true, 'Durasi magang harus diisi']
  },
  start_an_intern: {
    type: Date,
    default: Date.now()
  }
}, { timestamps: true });

module.exports = mongoose.model('Vacancy', vacancySchema);