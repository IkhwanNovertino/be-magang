const moment = require('moment');

const dateFormat = (value) => {
  let tgl = moment(value).format("D MMM YYYY");
  return tgl
}

module.exports = { dateFormat }