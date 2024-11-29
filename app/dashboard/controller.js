const Intern = require('../intern/model');
const Placement = require('../placement/model');
const Biro = require('../biro/model');
const Submission = require('../submission/model');
const Logbook = require('../logbook/model');
const Certificate = require('../certificate/model');

// Function count
const aggInternActive = async () => {
  const intern = await Intern.countDocuments({ statusIntern: 'active' });
  return intern;
}

const totalIntern = async () => {
  const toDay = new Date();
  const getFullYear = toDay.getFullYear();
  const intern = await Intern.countDocuments({ start_an_internship: { $gte: Date.parse(getFullYear) } });
  return intern;
}

const aggInternByBiro = async () => {
  const toDay = new Date();
  const getFullYear = toDay.getFullYear();

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

  const dataInternStatus = [];
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

  return dataInternStatus;
}

module.exports = {
  index: async (req, res) => {
    try {
      res.render('index', {
        title: 'Dashboard',
      })
    } catch (err) {
      console.log(`error di index controller biro >>${err}`);
    }
  },
  dashboardUmpeg: async (req, res) => {
    try {
      const submission = await Submission.find().sort({ createdAt: -1 }).limit(10)
      const dataSubmission = [];

      submission.forEach(item => {
        dataSubmission.push({
          id: item._id,
          status: item.status,
          doc_institute: item.doc_institute,
          type_of_submission: item.type_of_submission,
          candidates: item.candidates.length,
          createdAt: item.createdAt,
        })
      });

      return res.status(200).json({
        data: {
          card: {
            activeIntern: await aggInternActive(),
            total: await totalIntern(),
          },
          bar: await aggInternByBiro(),
          submission: dataSubmission,
        }
      })
    } catch (err) {
      return res.status(400).json({ message: err.message })
    }
  },
  dashboardSupervisor: async (req, res) => {
    try {
      const { id } = req.user;
      const intern = await Placement.find({ supervisor: id })
        .populate('intern')
        .sort({ createdAt: -1 })
        .limit(10)

      const dataIntern = [];
      intern.forEach(item => {
        dataIntern.push({
          name: item.intern.name,
          institute: item.intern.institute,
          major: item.intern.major,
          start_an_internship: item.intern.start_an_internship,
          end_an_internship: item.intern.end_an_internship,
          status: item.intern.statusIntern,
        });
      });

      return res.status(200).json({
        data: {
          card: {
            activeIntern: await aggInternActive(),
            total: await totalIntern(),
          },
          bar: await aggInternByBiro(),
          intern: dataIntern,
        }
      })
    } catch (err) {
      return res.status(400).json({ message: err.message })
    }
  },
  dashboardIntern: async (req, res) => {
    try {
      const placement = await Placement.findOne({ intern: req.user.id })
        .populate('intern')
        .populate('biro')
        .populate('supervisor');
      const logbook = await Logbook.find({ intern: req.user.id }).sort({ createdAt: -1 }).limit(5);
      const certificate = await Certificate.findOne({ intern: req.user.id });

      return res.status(200).json({
        data: {
          card: {
            name: placement.intern.name,
            biro: placement.biro.name,
            supervisor: placement.supervisor.name,
            start_an_internship: placement.intern.start_an_internship,
            end_an_internship: placement.intern.end_an_internship,
          },
          logbooks: logbook,
          certificate: certificate,
        }
      })
    } catch (err) {
      return res.status(400).json({ message: err.message })
    }
  }
}