const applicantModel = require('../applicants/model');
const umpegModel = require('../peg-umpeg/model');
const supervisorModel = require('../supervisor/model');
const pembinaModel = require('../pembina/model');
const internModel = require('../intern/model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../../config');

module.exports = {
  signup: async (req, res, next) => {
    try {
      const { name, institute, email, password, } = req.body;
      let applicant = new applicantModel({
        email: email.trim(),
        password,
        name: name.trim().toLowerCase(),
        institute: institute.trim().toLowerCase(),
      });
      await applicant.save();
      delete applicant._doc.password;

      return res.status(201).json({
        data: applicant
      })
    } catch (err) {
      if (err && err.name === "ValidationError") {
        const message = [];
        if (err.errors.name) {
          message.push(err.errors.name.message)
        }
        if (err.errors.email) {
          message.push(err.errors.email.message)
        }
        if (err.errors.institute) {
          message.push(err.errors.institute.message)
        }
        if (err.errors.password) {
          message.push(err.errors.institute.message)
        }

        return res.status(422).json({
          errors: {
            message: message
          },
        })
      }
      next()
    }
  },
  signin: async (req, res) => {
    try {
      const { username, password } = req.body;

      const authApplicant = await applicantModel.findOne({ email: username });
      const authPembina = await pembinaModel.findOne({ nip: username });
      const authSupervisor = await supervisorModel.findOne({ nip: username });
      const authUmpeg = await umpegModel.findOne({ nip: username });
      const authIntern = await internModel.findOne({ id_num: username });

      const auth = authApplicant || authPembina || authSupervisor || authUmpeg || authIntern;
      const roleUser = (authApplicant && 'applicant') || (authPembina && 'pembina') ||
        (authSupervisor && 'supervisor') || (authUmpeg && 'umpeg') || (authIntern && 'intern') || null;

      if (!auth) {
        const error = new Error('User tidak ditemukan');
        error.name = 'LoginError'
        throw error;
      }

      const checkPassword = await bcrypt.compare(password, auth.password);

      if (!checkPassword) {
        const error = new Error('Kata kunci salah');
        error.name = 'LoginError'
        throw error;
      }

      const isActiveUser = auth.status === 'Y' ? true : null;

      if (!isActiveUser) {
        const error = new Error('Akun telah di non aktifkan');
        error.name = 'LoginError'
        throw error;
      }

      const token = jwt.sign({
        user: {
          id: auth.id,
          name: auth.name,
          role: roleUser,
          avatar: auth.avatar,
        }
      }, config.jwtKey);


      return res.status(200).json({
        data: {
          token: token,
        }
      })
    } catch (err) {
      if (err.name === 'LoginError') {
        return res.status(400).json({
          errors: {
            message: [err.message]
          },
        })
      }
      return res.status(500).json({
        errors: {
          message: [err.message || 'Terjadi masalah dengan server']
        },
      })
    }
  },
}