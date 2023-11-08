const Applicant = require('../applicant/model');
const config = require('../../config');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = {
  signup: async (req, res, next) => {
    try {
      const payload = req.body;

      let applicant = new Applicant(payload);
      await applicant.save();
      delete applicant._doc.password

      res.status(201).json({ data: applicant })

    } catch (err) {
      if (err && err.name === "ValidationError") {
        return res.status(422).json({
          errors: err.errors
        })
      }
      next(err);
    }
  },
  signin: async (req, res) => {
    const { username, password } = req.body;

    Applicant.findOne({ username }).then((user) => {
      if (user) {
        const checkPassword = bcrypt.compareSync(password, user.password)
        if (checkPassword) {
          const token = jwt.sign({
            user: {
              id: user.id,
              username: user.username,
              name: user.name,
              email: user.email,
              phoneNumber: user.phoneNumber,
              avatar: user.avatar,
            }
          }, config.jwtKey)

          res.status(200).json({ data: { token } });
        } else {
          res.status(403).json({
            errors: {
              password: {
                message: 'password salah'
              }
            }
          })
        }
      } else {
        res.status(403).json({
          errors: {
            username: {
              message: "username tidak terdaftar"
            }
          }
        });
      }
    }).catch((err) => {
      res.status(500).json({
        errors: {
          message: err.message || 'Terjadi kesalahan pada server'
        }
      });
    })
  }
}