const mongoose = require('mongoose');

let logbokkSchema = mongoose.Schema({
  activity: {
    type: String,
    require: [true, 'Aktifitas magang harus diisi'],
  },
  description: {
    type: String,
    require: [true, 'Deskripsi aktifitas harus diisi']
  },
  comment: [{
    type: String,
    default: ""
  }],
  date: {
    type: Number
  },
  status: {
    type: String,
    enum: ['pending', 'success'],
    default: 'pending'
  },
  intern: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Intern',
  },
}, { timestamps: true })

module.exports = mongoose.model('Logbook', logbokkSchema);