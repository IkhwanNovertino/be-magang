const moment = require('moment');
const puppeteer = require('puppeteer')
const QRCode = require('qrcode');
const config = require('../config');

const path = require('path')

const dateFormat = (value) => {
  // const date = new Date(value)
  const tgl = moment(value).format("ll");
  return tgl
}

const dateFormatCertificate = (value) => {
  moment.locale('id');
  const tgl = moment(value).format("D MMMM YYYY")
  return tgl;
}

const dateFormatLogbook = (value) => {
  moment.locale('id');
  const tgl = moment(value).format("dddd, D MMMM YYYY")
  return tgl;
}

const dateForm = value => {
  const tgl = moment(value).format('ll')
  return tgl
}

const generateCertificate = async (certificate) => {
  try {
    console.log('Start generate certificate');
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Load the HTML template
    console.log('load HTML Template');
    await page.goto(`http://localhost:5000/certificate/template?uid=${certificate._id.toString()}`, {
      waitUntil: 'networkidle0'
    });

    // Generate QR code
    console.log('generate QRCode');
    const generateQRCode = await QRCode.toDataURL(certificate._id.toString());

    console.log('set QRCode to certificate');
    await page.evaluate((generateQRCode) => {
      const qrElement = document.getElementById('certificate-qrcode');
      const img = new Image();
      img.src = generateQRCode;
      qrElement.appendChild(img);
    }, generateQRCode)

    // Take a screenshot as PDF
    console.log('save pdf');
    await page.pdf({
      path: path.resolve(config.rootPath, `${config.urlUploads}/${certificate._id.toString()}.pdf`),
      format: 'A4',
      printBackground: true,
      landscape: true,
    });

    await browser.close();

    return 'Generating has been done'
  } catch (err) {
    return err;
  }
}

module.exports = { dateFormat, dateForm, generateCertificate, dateFormatCertificate, dateFormatLogbook }