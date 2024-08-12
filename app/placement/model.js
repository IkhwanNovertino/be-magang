const mongoose = require('mongoose');

let placementSchema = mongoose.Schema({
  intern: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Intern',
  },
  supervisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supervisor',
  },
  biro: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Biro',
  },
}, { timestamps: true })

module.exports = mongoose.model('Placement', placementSchema);