const ScoreComponent = require('./model')

const path = 'admin/score-component';

module.exports = {
  index: async (req, res) => {
    try {
      const alertMessage = req.flash('alertMessage');
      const alertStatus = req.flash('alertStatus');
      const alert = { message: alertMessage, status: alertStatus };

      const score = await ScoreComponent.find().sort({ category: 1 });

      res.render(`${path}/view_score`, {
        title: 'Komponen Nilai',
        score,
        alert
      })
    } catch (err) {
      req.flash('alertMessage', `${err.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/score')
    }
  },
  viewCreate: async (req, res) => {
    try {
      res.render(`${path}/create`, {
        title: 'Tambah Komponen Nilai'
      })
    } catch (err) {
      req.flash('alertMessage', `${err.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/score')
    }
  },
  actionCreate: async (req, res) => {
    try {
      const { title, category } = req.body;
      console.log(req.body);

      const scoreComponent = new ScoreComponent({
        title: title.toLowerCase(),
        category
      });
      await scoreComponent.save();

      req.flash('alertMessage', 'Berhasil Menambah Komponen Nilai');
      req.flash('alertStatus', 'success');
      res.redirect('/score');
    } catch (err) {
      req.flash('alertMessage', `${err.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/score')
    }
  },
  viewEdit: async (req, res) => {
    try {
      const { id } = req.params;
      const score = await ScoreComponent.findById(id);

      res.render(`${path}/edit`, {
        title: 'Ubah Komponen Nilai',
        score
      })
    } catch (err) {
      req.flash('alertMessage', `${err.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/score')
    }
  },
  actionEdit: async (req, res) => {
    try {
      const { id } = req.params;
      const { title, category } = req.body;

      await ScoreComponent.findOneAndUpdate(
        { _id: id },
        {
          title: title.toLowerCase(),
          category
        }
      );

      req.flash('alertMessage', 'Berhasil Mengubah Komponen Nilai');
      req.flash('alertStatus', 'success');
      res.redirect('/score');
    } catch (err) {
      req.flash('alertMessage', `${err.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/score')
    }
  },
  actionDelete: async (req, res) => {
    try {
      const { id } = req.params;
      await ScoreComponent.findOneAndRemove({ _id: id });

      req.flash('alertMessage', 'Berhasil Menghapus Komponen Nilai');
      req.flash('alertStatus', 'success');
      res.redirect('/score');
    } catch (err) {
      req.flash('alertMessage', `${err.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/score')
    }
  },
  createScoreComponent: async (req, res) => {
    try {
      const { title, category } = req.body;

      if (req.user.role !== 'supervisor') {
        return res.status(401).json({
          errors: {
            message: [
              'Not authorized to access this resource',
            ]
          }
        })
      }

      const scoreComponent = new ScoreComponent({
        title: title.toLowerCase(),
        category
      });
      await scoreComponent.save();

      res.status(201).json({
        data: scoreComponent,
      });
    } catch (err) {
      console.log(`ERRRR di createScoreComponents >>> ${err.name}`);
      if (err && err.name === 'ValidationError') {
        const message = [];
        if (err.errors.title) message.push(err.errors.title.message);
        if (err.errors.category) message.push(err.errors.category.message);

        return res.status(422).json({
          message: message,
          fields: err.errors,
        });
      }
      res.status(500).json({
        errors: {
          message: [
            err.message || 'Terjadi masalah pada server',
          ],
        },
      })
    }
  },
  getScoreComponent: async (req, res) => {
    try {
      const scoreComponent = await ScoreComponent.find();

      res.status(200).json({
        data: scoreComponent,
      });
    } catch (err) {
      res.status(500).json({
        errors: {
          message: [
            err.message || 'Terjadi masalah pada server',
          ],
        },
      })
    }
  },
}