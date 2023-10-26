const mongoose = require('mongoose');

let biroSchema = mongoose.Schema({
  name: {
    type: String,
    require: [true, "Nama bidang kegiatan harus diisi"]
  }
}, { timestamps: true })

module.exports = mongoose.model('Biro', biroSchema);