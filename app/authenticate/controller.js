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
      let checkPassword = false;

      const authApplicant = await applicantModel.findOne({ email: username });
      const authPembina = await pembinaModel.findOne({ nip: username });
      const authSupervisor = await supervisorModel.findOne({ nip: username });
      const authUmpeg = await umpegModel.findOne({ nip: username });
      const authIntern = await internModel.findOne({ id_num: username });

      if (authApplicant) {
        checkPassword = bcrypt.compareSync(password, authApplicant.password);
        if (checkPassword) {
          if (authApplicant.status === 'Y') {
            const token = jwt.sign({
              user: {
                id: authApplicant.id,
                name: authApplicant.name,
                role: 'applicant',
                avatar: authApplicant.avatar,
              }
            }, config.jwtKey);
            return res.status(200).json({
              data: {
                token: token,
              }
            })
          } else {
            return res.status(403).json({
              errors: {
                message: ['Akun telah di non aktifkan']
              }
            })
          }
        } else {
          return res.status(400).json({
            errors: {
              message: ['Password salah, isi kembali!']
            }
          })
        }
      } else if (authPembina) {
        checkPassword = bcrypt.compareSync(password, authPembina.password)
        if (checkPassword) {
          if (authPembina.status === 'Y') {
            const token = jwt.sign({
              user: {
                id: authPembina.id,
                name: authPembina.name,
                role: 'pembina',
                avatar: authPembina.avatar,
              }
            }, config.jwtKey);
            return res.status(200).json({
              data: {
                token: token,
              }
            })
          } else {
            return res.status(403).json({
              errors: {
                message: ['Akun telah di non aktifkan']
              }
            })
          }
        } else {
          return res.status(400).json({
            errors: {
              message: ['Password salah, isi kembali!']
            }
          })
        }
      } else if (authSupervisor) {
        checkPassword = bcrypt.compareSync(password, authSupervisor.password);
        console.log(checkPassword);
        if (checkPassword) {
          if (authSupervisor.status === 'Y') {
            const token = jwt.sign({
              user: {
                id: authSupervisor.id,
                name: authSupervisor.name,
                role: 'supervisor',
                avatar: authSupervisor.avatar,
              }
            }, config.jwtKey);
            return res.status(200).json({
              data: {
                token: token,
              }
            })
          } else {
            return res.status(403).json({
              errors: {
                message: ['Akun telah di non aktifkan']
              }
            })
          }
        } else {
          return res.status(400).json({
            errors: {
              message: ['Password salah, isi kembali!']
            }
          })
        }
      } else if (authUmpeg) {
        checkPassword = bcrypt.compareSync(password, authUmpeg.password)
        if (checkPassword) {
          if (authUmpeg.status === 'Y') {
            const token = jwt.sign({
              user: {
                id: authUmpeg.id,
                name: authUmpeg.name,
                role: 'umpeg',
                avatar: authUmpeg.avatar,
              }
            }, config.jwtKey);
            return res.status(200).json({
              data: {
                token: token,
              }
            })
          } else {
            return res.status(403).json({
              errors: {
                message: ['Akun telah di non aktifkan']
              }
            })
          }
        } else {
          return res.status(400).json({
            errors: {
              message: ['Password salah, isi kembali!']
            }
          })
        }
      } else if (authIntern) {
        checkPassword = bcrypt.compareSync(password, authIntern.password)
        if (checkPassword) {
          if (authIntern.status === 'Y') {
            const token = jwt.sign({
              user: {
                id: authIntern.id,
                name: authIntern.name,
                role: 'intern',
                avatar: authIntern.avatar,
              }
            }, config.jwtKey);
            return res.status(200).json({
              data: {
                token: token,
              }
            })
          } else {
            return res.status(403).json({
              errors: {
                message: ['Akun telah di non aktifkan']
              }
            })
          }
        } else {
          return res.status(400).json({
            errors: {
              message: ['Password salah, isi kembali!']
            }
          })
        }
      } else {
        return res.status(404).json({
          errors: {
            message: ['user tidak ditemukan']
          }
        })
      }
    } catch (err) {
      console.log(err);
      return res.status(422).json({
        errors: err.errors,
      })
    }
  },
}