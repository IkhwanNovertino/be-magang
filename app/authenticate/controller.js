const authModel = require('./model');
const applicantModel = require('../applicants/model');
const umpegModel = require('../peg-umpeg/model');
const supervisorModel = require('../supervisor/model');
const pembinaModel = require('../pembina/model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../../config');

module.exports = {
  signup: async (req, res, next) => {
    try {
      const { username, password, confirmPassword, name, institute, } = req.body;

      if (password === confirmPassword) {
        if (!name) return res.status(403)
          .json({
            errors: {
              name: [
                'nama harus diisi'
              ]
            }
          })

        if (!institute) return res.status(403)
          .json({
            errors: {
              institute: [
                'Sekolah atau perguruan tinggi atau institusi harus diisi'
              ]
            }
          })

        let user = new authModel({ username, password, role: "applicant" });
        await user.save();

        let applicant = new applicantModel({ username, name, institute });
        await applicant.save();

        delete user._doc.password;

        return res.status(201).json({
          data: user
        })
      } else {
        return res.status(403).json({
          errors: {
            confirmPassword: [
              'password tidak terkonfirmasi'
            ]
          }
        })
      }
    } catch (err) {
      if (err && err.name === "ValidationError") {
        return res.status(422).json({
          errors: err.errors
        })
      }
      next()
    }
  },
  signin: async (req, res) => {
    try {
      const { username, password } = req.body;

      const authData = await authModel.findOne({ username })

      if (authData) {
        const checkPassword = bcrypt.compareSync(password, authData.password);
        if (checkPassword) {
          let dataUser = {};
          switch (authData.role) {
            case "applicant":
              dataUser = await applicantModel.findOne({ username });
              break;
            case "umpeg":
              dataUser = await umpegModel.findOne({ nip: username });
              break;
            case "supervisor":
              dataUser = await supervisorModel.findOne({ nip: username });
              break;
            case "pembina":
              dataUser = await pembinaModel.findOne({ nip: username });
              break;
            default:
              break;
          }
          console.log(dataUser);

          const token = jwt.sign({
            user: {
              idUser: dataUser.id,
              idAuth: authData.id,
              username: dataUser.username,
              name: dataUser.name,
              role: authData.role,
              photo_profile: dataUser.photo_profile,
            }
          }, config.jwtKey)

          res.status(200).json({ data: { token } });

        } else {
          return res.status(403).json({
            errors: {
              password: [
                'password salah'
              ]
            }
          })
        }
      } else {
        return res.status(403).json({
          errors: {
            username: [
              'username tidak ditemukan'
            ]
          }
        })
      }

    } catch (err) {
      return res.status(422).json({
        errors: err.errors,
      })
    }
  },
}