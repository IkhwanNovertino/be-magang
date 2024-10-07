const Evaluation = require('./model');

module.exports = {
  createEvaluation: async (req, res) => {
    try {
      const { intern, score } = req.body;
      const res_score = typeof score === 'string' ? JSON.parse(score) : score;

      if (req.user.role !== 'supervisor') {
        return res.status(401).json({
          errors: {
            message: [
              'Not authorized to access this resource',
            ],
          }
        })
      }
      const res_evaluation = await Evaluation.findOne({ intern: intern })
      if (!res_evaluation) {
        const evaluation = new Evaluation({
          intern: intern,
          supervisor: req.user.id,
          score: res_score,
        });
        await evaluation.save();

        res.status(201).json({
          data: evaluation,
        });
      } else {
        res_evaluation.score.push(res_score);

        await res_evaluation.save();

        res.status(201).json({
          data: res_evaluation,
        });
      }




    } catch (err) {
      console.log(`ERRRR di createEvaluation >>> ${err}`);
      // if (err && err.name === 'ValidationError') {
      //   const message = [];
      //   if (err.errors.intern) message.push(err.errors.title.message);
      //   if (err.errors.category) message.push(err.errors.category.message);

      //   return res.status(422).json({
      //     message: message,
      //     fields: err.errors,
      //   });
      // }
      res.status(500).json({
        errors: {
          message: [
            err.message || 'Terjadi masalah pada server',
          ],
          fields: err.errors
        },
      })
    }
  },
  getEvaluationById: async (req, res) => {
    try {
      const { id } = req.params;
      const evaluation = await Evaluation.findOne({ intern: id })
        .populate('intern')
        .populate('score.title');

      res.status(200).json({
        data: evaluation,
      });
    } catch (err) {
      console.log(`ERRRR di getEvaluationById >>> ${err}`);
      // if (err && err.name === 'ValidationError') {
      //   const message = [];
      //   if (err.errors.title) message.push(err.errors.title.message);
      //   if (err.errors.category) message.push(err.errors.category.message);

      //   return res.status(422).json({
      //     message: message,
      //     fields: err.errors,
      //   });
      // }
      res.status(500).json({
        errors: {
          message: [
            err.message || 'Terjadi masalah pada server',
          ],
        },
      })
    }
  },
  updateEvaluation: async (req, res) => {
    try {
      const { id } = req.params;
      const { score } = req.body;

      const res_score = typeof score === 'string' ? JSON.parse(score) : score;

      const evaluate = await Evaluation.findOneAndUpdate({ _id: id }, { score: res_score }, { new: true });

      res.status(201).json({
        data: evaluate,
      });
    } catch (err) {
      res.status(500).json({
        errors: {
          message: [
            err.message || 'Terjadi masalah pada server',
          ],
        },
      });
    }
  },
};