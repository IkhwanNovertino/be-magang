const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

let evaluationSchema = mongoose.Schema({
  intern: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Intern',
  },
  supervisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supervisor',
  },
  status: {
    type: String,
    enum: ['pending', 'success'],
    default: 'pending',
  },
  score: [{
    title: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ScoreComponent',
    },
    number: {
      type: Number,
      default: 0
    },
  }],
  // for cerificate number
  inc_reference: {
    type: Number
  },
  evaluateId: {
    type: Number
  },
}, { timestamps: true });

evaluationSchema.pre('save', function (next) {
  this.inc_reference = new Date().getFullYear();
  next();
});

evaluationSchema.plugin(AutoIncrement, {
  id: 'certif',
  inc_field: 'evaluateId',
  reference_fields: ['inc_reference']
});

module.exports = mongoose.model('Evaluation', evaluationSchema);