const ScoreComponent = require('./model')

module.exports = {
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
      const { category } = req.query;
      const scoreComponent = await ScoreComponent.find({ category: category });

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