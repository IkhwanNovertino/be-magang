const mongoose = require('mongoose');

let biroSchema = mongoose.Schema({
  name: {
    type: String,
    require: [true, "Nama bidang kegiatan harus diisi"]
  }
})

module.exports = mongoose.model('Biro', biroSchema);