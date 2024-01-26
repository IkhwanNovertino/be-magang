const mongoose = require('mongoose');

let applicantSchema = mongoose.Schema({
  name: {
    type: String,
    // validate: {
    //   validator: function (v) {
    //     if (!v) {
    //       throw new Error('name not null')
    //     }
    //   },
    //   message: props => `${props.value} is not null`
    // },
    require: [true, "Nama pemohon harus diisi"]
  },
  institute: {
    type: String,
    require: [true, "Institusi harus diisi"],
  },
  contact: {
    email: {
      type: String,
      default: 'default@gmail.com'
    },
    phone_num: {
      type: Number,
      default: 1,
    }
  },
  photo_profile: {
    type: String,
    default: "none"
  },
  username: {
    type: String,
  }
}, { timestamps: true })

module.exports = mongoose.model('Applicant', applicantSchema);