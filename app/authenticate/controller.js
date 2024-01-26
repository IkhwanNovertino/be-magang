const authModel = require('./model');
const applicantModel = require('../applicants/model');
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

        let user = new authModel({ username, password, role: "pemohon" });
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
        console.log(`ERRORS >>> ${err.errors.username.path}`);
        const username = err.errors.username.path
        return res.status(422).json({
          errors: {
            username: [
              err.errors.username.message
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
          let dataUser;
          switch (authData.role) {
            case "pemohon":
              dataUser = await applicantModel.findOne({ username });
              break;
            default:
              break;
          }

          const token = jwt.sign({
            user: {
              id: dataUser.id,
              username: dataUser.username,
              name: dataUser.name,
              email: dataUser.contact.email,
              phoneNumber: dataUser.contact.phone_num,
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

    }
    // const { username, password } = req.body;

    // authModel.findOne({ username }).then((user) => {
    //   if (user) {
    //     const checkPassword = bcrypt.compareSync(password, user.password);
    //     if (checkPassword) {
    //       let dataUser;
    //       if (user.role === "pemohon") {
    //         dataUser = await applicantModel.findOne({ username })
    //       }
    //       return res.status(201).json({
    //         data: {
    //           user
    //         }
    //       })
    //     } else {
    //       return res.status(403).json({
    //         errors: {
    //           password: [
    //             'password salah'
    //           ]
    //         }
    //       })
    //     }
    //   } else {
    //     return res.status(403).json({
    //       errors: {
    //         username: [
    //           'username tidak ditemukan'
    //         ]
    //       }
    //     })
    //   }

    // }).catch((err) => {
    //   console.log(`ERROR >>> ${err}`);
    // });
  }
}