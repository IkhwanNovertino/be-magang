const moment = require('moment');

const dateFormat = (value) => {
  // const date = new Date(value)
  const tgl = moment(value).format("ll");
  return tgl
}

const dateForm = value => {
  const tgl = moment(value).format('ll')
  return tgl
}

module.exports = { dateFormat, dateForm }