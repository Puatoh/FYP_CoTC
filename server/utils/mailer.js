const nodemailer = require('nodemailer');
require('dotenv').config();

// Uses Gmail SMTP; set EMAIL_USER and EMAIL_PASS in server/.env
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async (to, subject, html) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html
  });
};

module.exports = sendEmail;