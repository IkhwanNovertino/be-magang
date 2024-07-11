const mongoose = require('mongoose');
const { validate } = require('uuid');

let submissionSchema = mongoose.Schema({
  doc_institute: {
    type: String,
    require: [true, 'Nama institusi surat tidak boleh kosong'],
    minLength: [3, 'Nama instansi surat tidak valid']
  },
  doc_number: {
    type: String,
    require: [true, 'Nomor surat tidak boleh kosong'],
    minLength: [3, 'Nomor surat tidak valid'],
  },
  doc_date: {
    type: Number,
    require: [true, 'Tanggal surat pengajuan tidak boleh kosong'],
    validate: {
      validator: (value) => {
        // get unix epoch time to date type
        const date = new Date(value);
        return date <= new Date();
      },
      message: props => `data tidak valid, tanggal harus hari ini atau sebelumnya`,
    },
  },
  start_an_internship: {
    type: Number,
    require: [true, 'Tanggal mulai magang tidak boleh kosong'],
    validate: {
      validator: (value) => {
        // get unix epoch time to date type
        const date = new Date(value);
        return date >= new Date();
      },
      message: props => `data tidak valid, tanggal harus hari ini, besok, dan seterusnya.`,
    },
  },
  end_an_internship: {
    type: Number,
    require: [true, 'Tanggal selesai magang tidak boleh kosong'],
    validate: {
      validator: (value) => {
        // get unix epoch time to date type
        const date = new Date(value);
        return date >= new Date();
      },
      message: props => `data tidak valid, tanggal harus hari ini, besok, dan seterusnya.`,
    },
  },
  offering_letter: {
    type: String,
    require: [true, 'Surat pengajuan magang harus dilampirkan']
  },
  acceptance_letter: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'confirmed', 'failed'],
    default: 'pending',
  },
  vacancy: {
    type: String,
    default: '1'
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Applicant',
  },
  candidates: [{
    name: {
      type: String,
      require: [true, 'Nama kandidat peserta tidak boleh kosong'],
    },
    id_num: {
      type: String,
      require: [true, 'Nomor Induk Siswa/Mahasiswa/Pegawai tidak boleh kosong'],
    },
    major: {
      type: String,
      require: [true, 'Jurusan tidak boleh kosong']
    },
    levels: {
      String,
      enum: ['slta', 'college', 'employee'],
      default: ['college']
    }
  }]
}, { timestamps: true })

module.exports = mongoose.model('Submission', submissionSchema);