const mongoose = require('mongoose');
// const AutoIncrement = require('mongoose-sequence')(mongoose);

const certificateSchema = mongoose.Schema({
  intern: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Intern',
  },
  pembina: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pembina',
  },
  evaluation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Evaluation',
  },
  publish_date: {
    type: Number,
  },
  certif_num: {
    type: String,
  },
}, { timestamps: true });

// certificateSchema.pre('save', function (next) {
//   this.inc_reference = new Date(this.publish_date).getFullYear();
//   next();
// });

// certificateSchema.plugin(AutoIncrement, {
//   id: 'certif',
//   inc_field: 'certif_seq',
//   reference_fields: ['inc_reference']
// });

// certificateSchema.pre('save', function (next) {
//   if (this.certif_seq <= 9) {
//     this.certif_num = `13/00${this.certif_seq}/SRT/INFO/KOMINFO`
//   } else {
//     this.certif_num = `13/0${this.certif_seq}/SRT/INFO/KOMINFO`
//   }
//   next();
// })

module.exports = mongoose.model('Certificate', certificateSchema);