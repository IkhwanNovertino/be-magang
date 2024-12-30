const Intern = require("../intern/model");
const Placement = require("../placement/model");
const Biro = require("../biro/model");
const Pembina = require("../pembina/model")
const { dateFormatCertificate } = require("../../utils");

const path = 'admin/recapitulation';

const recapitulasiFunc = async (date) => {
  const tgl = date.split(" - ");
  const dateStart = new Date(tgl[0]);
  const dateEnd = new Date(tgl[1]);
  const biro = await Biro.find().sort({ name: 1 });

  const dataIntern = await Intern.find({
    start_an_internship: { $lt: dateEnd },
    end_an_internship: { $gt: dateStart }
  });

  const sltaIntern = dataIntern.filter(items => items.levels === 'slta');
  const collegeIntern = dataIntern.filter(items => items.levels === 'college');
  const etcIntern = dataIntern.filter(items => items.levels === 'employee');
  const internByPlacement = await Placement.aggregate([
    {
      $lookup: {
        from: "interns",
        localField: "intern",
        foreignField: "_id",
        as: "intern"
      }
    },
    {
      $match: {
        $and: [
          { "intern.start_an_internship": { $lt: Date.parse(dateEnd) } },
          { "intern.end_an_internship": { $gt: Date.parse(dateStart) } }
        ]
      }
    },
    {
      $group: {
        _id: '$biro',
        intern: { $count: {} },
      }
    }
  ])


  const dataInternByPlacemet = [];
  for (const item of biro) {
    dataInternByPlacemet.push({
      id: item._id.toString(),
      name: item.name,
      count: 0
    })
  }
  dataInternByPlacemet.forEach(items => {
    internByPlacement.forEach(element => {
      if (items.id === element._id.toString()) {
        items.count = element.intern;
      }
    });
  });

  const result = {
    total: dataIntern.length,
    slta: sltaIntern.length,
    college: collegeIntern.length,
    etc: etcIntern.length,
    dataInternByPlacemet,
    date: [dateStart, dateEnd, Date.now()],
  }

  return result;

}

module.exports = {
  index: async (req, res) => {
    try {
      const alertMessage = req.flash('alertMessage');
      const alertStatus = req.flash('alertStatus');
      const alert = { message: alertMessage, status: alertStatus };
      let tanggal;

      res.render(`${path}/view_recapitulation`, {
        title: 'Laporan Rekapitulasi',
        tanggal,
        status: false,
        alert
      })
    } catch (err) {
      console.log(err);
      req.flash('alertMessage', `${err.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/recap')
    }
  },
  viewCreate: async (req, res) => {
    try {
      const { date } = req.query;

      const data = await recapitulasiFunc(date);
      const pembina = await Pembina.findOne({ status: 'Y' });


      res.render(`${path}/view_recapitulation`, {
        title: 'Laporan Kegiatan',
        status: true,
        tanggal: date,
        data,
        pembina,
        dateFormatCertificate,
      })
    } catch (err) {
      console.log(err);

      req.flash('alertMessage', `${err.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/')
    }
  },
  actionPrint: async (req, res) => {
    try {
      const { date } = req.query;
      console.log(date);

      const data = await recapitulasiFunc(date);
      const pembina = await Pembina.findOne({ status: 'Y' });

      res.render(`${path}/template_print`, {
        title: 'Laporan Kegiatan',
        status: true,
        data,
        pembina,
        dateFormatCertificate,
      })
    } catch (err) {
      console.log(err);

      req.flash('alertMessage', `${err.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/')
    }
  },
  viewEdit: async (req, res) => {
    try {
      const { id } = req.params;
      const biro = await Biro.findById(id);

      res.render(`${path}/edit`, {
        title: 'Ubah Bidang Kegiatan',
        biro
      })
    } catch (err) {
      req.flash('alertMessage', `${err.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/biro')
    }
  },
  actionEdit: async (req, res) => {
    try {
      const { id } = req.params;
      const { name } = req.body;

      await Biro.findOneAndUpdate({ _id: id }, { name: name.toUpperCase() });

      req.flash('alertMessage', 'Berhasil Mengubah Bidang Kegiatan');
      req.flash('alertStatus', 'success');
      res.redirect('/biro');
    } catch (err) {
      req.flash('alertMessage', `${err.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/biro')
    }
  },
  actionDelete: async (req, res) => {
    try {
      const { id } = req.params;
      await Biro.findOneAndRemove({ _id: id });

      req.flash('alertMessage', 'Berhasil Menghapus Bidang Kegiatan');
      req.flash('alertStatus', 'success');
      res.redirect('/biro');
    } catch (err) {
      req.flash('alertMessage', `${err.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/biro')
    }
  },
}