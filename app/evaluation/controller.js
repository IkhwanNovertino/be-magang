const Evaluation = require('./model');

module.exports = {
  createEvaluation: async (req, res) => {
    try {
      const { intern, score } = req.body;
      if (req.user.role !== 'supervisor') {
        return res.status(401).json({
          errors: {
            message: [
              'Not authorized to access this resource',
            ],
          }
        })
      }
      const res_score = typeof score === 'string' ? JSON.parse(score) : score;

      const evaluation = new Evaluation({
        intern: intern,
        supervisor: req.user.id,
        score: res_score,
      });
      await evaluation.save();

      res.status(201).json({
        data: evaluation,
      });
    } catch (err) {
      console.log(`ERRRR di createEvaluation >>> ${err}`);
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
};