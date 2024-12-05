const mongoose = require('mongoose');
// const AutoIncrement = require('mongoose-sequence')(mongoose);

const certificateSchema = mongoose.Schema({
  historyIntern: {
    name: {
      type: String,
    },
    start_an_internship: {
      type: Number,
    },
    end_an_internship: {
      type: Number,
    },
    major: {
      type: String,
    },
    duration_internship: {
      type: String,
    }
  },
  historyEvaluation: {
    category_score: [{
      name: {
        type: String,
      },
      score: [{
        title: {
          type: String,
        },
        category: {
          type: String,
        },
        grade_number: {
          type: Number,
        },
        grade_string: {
          type: String,
        }
      }],
    }],
    total: {
      total_number: {
        type: Number
      },
      mean: {
        type: Number
      },
      total_string: {
        type: String,
      }
    }
  },
  historyPembina: {
    name: {
      type: String,
    },
    nip: {
      type: String,
    },
    position: {
      type: String,
    },
    pangkat: {
      type: String,
    },
  },

  publish_date: {
    type: Number,
  },
  certif_num: {
    type: String,
  },
  result: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'success'],
    default: 'pending',
  },

  pembina: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pembina',
  },
  evaluation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Evaluation',
  },
  intern: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Intern',
  },
}, { timestamps: true });

module.exports = mongoose.model('Certificate', certificateSchema);