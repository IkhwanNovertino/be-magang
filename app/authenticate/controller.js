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
      const { name, institute, email, password, } = req.body;
      let applicant = new applicantModel({ email, name, institute, password });
      await applicant.save();

      delete applicant._doc.password;

      return res.status(201).json({
        data: applicant
      })
    } catch (err) {
      if (err && err.name === "ValidationError") {
        return res.status(422).json({
          errors: {
            name: [
              err.errors?.name?.message || ''
            ],
            email: [
              err.errors?.email?.message || ''
            ],
            password: [
              err.errors?.password?.message || ''
            ],
            institute: [
              err.errors?.institute?.message || ''
            ]
          }
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