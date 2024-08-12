const mongoose = require('mongoose');
const { validate } = require('uuid');

let scoreComponentSchema = mongoose.Schema({
  title: {
    type: String,
    require: [true, 'Komponen nilai harus diisi'],
    validate: {
      validator: function (value) {
        return value.length >= 3
      },
      message: props => `${props.value} terlalu pendek. Komponen nilai tidak boleh kurang dari 3 karakter`
    }
  },
  category: {
    type: String,
    validate: {
      validator: function (value) {
        return ["NT", "T"].includes(value);
      },
      message: props => `kategori ${props.value} tidak valid`
    },
  },
}, { timestamps: true });

module.exports = mongoose.model('ScoreComponent', scoreComponentSchema);