const mongoose = require('mongoose');

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
    enum: ['pending', 'accept', 'reject'],
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
}, { timestamps: true });

module.exports = mongoose.model('Evaluation', evaluationSchema);