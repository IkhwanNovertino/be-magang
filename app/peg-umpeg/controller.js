const Peg_umpeg = require('./model');
const path = require('path');
const fs = require('fs');
const config = require('../../config');
const Intern = require('../intern/model');
const Placement = require('../placement/model');
const Biro = require('../biro/model');

const urlpath = 'admin/peg-umpeg';

module.exports = {
  index: async (req, res) => {
    try {
      const alertMessage = req.flash('alertMessage');
      const alertStatus = req.flash('alertStatus');
      const alert = { message: alertMessage, status: alertStatus };

      const peg_umpeg = await Peg_umpeg.find();

      res.render(`${urlpath}/view_pegumpeg`, {
        title: 'Pegawai Umpeg',
        peg_umpeg,
        alert
      })
    } catch (err) {
      req.flash('alertMessage', `${err.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/pegumpeg')
    }
  },
  viewCreate: async (req, res) => {
    try {
      res.render(`${urlpath}/create`, {
        title: 'Tambah Pegawai Umpeg'
      })
    } catch (err) {
      req.flash('alertMessage', `${err.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/pegumpeg')
    }
  },
  actionCreate: async (req, res) => {
    try {
      const { name, nip, job_title, email, phone_num } = req.body;

      const noInduk = nip.replace(/ /gi, '');

      if (req.file) {
        let tmp_path = req.file.path;
        let originalExt = req.file.originalname.split('.')[req.file.originalname.split('.').length - 1];
        let filename = req.file.filename + '.' + originalExt;
        let target_path = path.resolve(config.rootPath, `${config.urlUploads}/${filename}`);

        const src = fs.createReadStream(tmp_path);
        const dest = fs.createWriteStream(target_path);

        src.pipe(dest)
        src.on('end', async () => {
          try {
            const peg_umpeg = new Peg_umpeg({
              name: name.trim().toLowerCase(),
              nip: noInduk,
              job_title: job_title.trim().toLowerCase(),
              email: email.trim(),
              phone_num,
              password: noInduk,
              avatar: filename
            });
            await peg_umpeg.save();

            delete peg_umpeg._doc.password;

            req.flash('alertMessage', 'Berhasil Menambah Pegawai Umpeg');
            req.flash('alertStatus', 'success');
            res.redirect('/pegumpeg');
          } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/pegumpeg');
          }
        })
      } else {
        const peg_umpeg = new Peg_umpeg({
          name: name.trim().toLowerCase(),
          nip: noInduk,
          job_title: job_title.trim().toLowerCase(),
          email: email.trim(),
          phone_num,
          password: noInduk,
        });
        await peg_umpeg.save();

        delete peg_umpeg._doc.password;

        req.flash('alertMessage', 'Berhasil Menambah Pegawai Umpeg');
        req.flash('alertStatus', 'success');
        res.redirect('/pegumpeg');
      }
    } catch (err) {
      req.flash('alertMessage', `${err.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/pegumpeg')
    }
  },
  viewDetail: async (req, res) => {
    try {
      const { id } = req.params;
      const peg_umpeg = await Peg_umpeg.findById(id);
      const imgURL = config.urlIMG;

      res.render(`${urlpath}/detail`, {
        title: 'Detail Pegawai Umpeg',
        peg_umpeg,
        imgURL,
      })
    } catch (err) {
      req.flash('alertMessage', `${err.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/pegumpeg')
    }
  },
  actionDelete: async (req, res) => {
    try {
      const { id } = req.params;

      const peg_umpeg = await Peg_umpeg.findOneAndRemove({
        _id: id
      });

      let currentImage = `${config.rootPath}/public/uploads/${peg_umpeg.avatar}`;
      if (fs.existsSync(currentImage)) {
        fs.unlinkSync(currentImage)
      }

      req.flash('alertMessage', 'Berhasil Menghapus Data Pegawai Umpeg');
      req.flash('alertStatus', 'success');

      res.redirect('/pegumpeg')
    } catch (err) {
      req.flash('alertMessage', `${err.message}`)
      req.flash('alertStatus', 'danger')
      res.redirect('/pegumpeg')
    }
  },
  actionStatus: async (req, res) => {
    try {
      const { id } = req.params;
      let peg_umpeg = await Peg_umpeg.findOne({ _id: id })

      let status = peg_umpeg.status === 'Y' ? 'N' : 'Y';
      let message = status === 'Y' ? 'Akun user telah aktif' : 'Akun user telah di non-aktif';

      await Peg_umpeg.findOneAndUpdate({ _id: id }, { status });

      req.flash('alertMessage', message);
      req.flash('alertStatus', 'success');
      res.redirect('/pegumpeg')
    } catch (err) {
      req.flash('alertMessage', `${err.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/pegumpeg')
    }
  },
  dashboard: async (req, res) => {
    try {
      const toDay = new Date();
      const getFullYear = toDay.getFullYear();

      const internActive = await Intern.countDocuments({ statusIntern: 'active' });
      const internSum = await Intern.countDocuments({ start_an_internship: { $gte: Date.parse(getFullYear) } });
      const biro = await Biro.find();
      const placementInternStatus = await Placement.aggregate([
        {
          $group: {
            _id: '$biro',
            intern: { $push: '$intern' }
          }
        }, {
          $lookup: {
            from: "interns",
            localField: "intern",
            foreignField: "_id",
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      {
                        $gte: [
                          "$start_an_internship",
                          Date.parse(getFullYear)
                        ]
                      },
                      {
                        $eq: [
                          "$statusIntern",
                          "pending"
                        ]
                      }
                    ]
                  }
                }
              }
            ],
            as: "internPending"
          }
        }, {
          $lookup: {
            from: "interns",
            localField: "intern",
            foreignField: "_id",
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      {
                        $gte: [
                          "$start_an_internship",
                          Date.parse(getFullYear)
                        ]
                      },
                      {
                        $eq: [
                          "$statusIntern",
                          "active"
                        ]
                      }
                    ]
                  }
                }
              }
            ],
            as: "internActive"
          }
        }, {
          $lookup: {
            from: "interns",
            localField: "intern",
            foreignField: "_id",
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      {
                        $gte: [
                          "$start_an_internship",
                          Date.parse(getFullYear)
                        ]
                      },
                      {
                        $eq: [
                          "$statusIntern",
                          "finish"
                        ]
                      }
                    ]
                  }
                }
              }
            ],
            as: "internFinish"
          }
        }
      ])


      // console.log(biro);


      const dataInternStatus = [];
      // placementInternStatus.forEach(item => {
      //   biro.forEach(element => {
      //     if (item._id.toString() === element._id.toString()) {
      //       dataInternStatus.push({
      //         name: element.name,
      //         count: [
      //           (item.internPending.length || 0),
      //           (item.internActive.length || 0),
      //           (item.internFinish.length || 0),
      //         ],
      //       })
      //     } else if (!item._id.toString()) {
      //       dataInternStatus.push({
      //         name: element.name,
      //         count: [0, 0, 0],
      //       })
      //     }
      //   });
      // });
      for (const item of biro) {
        placementInternStatus.forEach(element => {
          if (item._id.toString() === element._id.toString()) {
            dataInternStatus.push({
              name: item.name,
              count: [
                (element.internPending.length || 0),
                (element.internActive.length || 0),
                (element.internFinish.length || 0),
              ],
            })
          }
        });
      }

      // console.log(placementInternStatus);
      console.log(dataInternStatus);

      return res.status(200).json({
        data: {
          card: {
            activeIntern: internActive,
            total: internSum,
          }
        }
      })
    } catch (err) {
      return res.status(400).json({ message: err.message })
    }
  }
}