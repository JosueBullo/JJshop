const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

// Log environment variables
console.log('Mailtrap User:', process.env.MAILTRAP_USER);
console.log('Mailtrap Pass:', process.env.MAILTRAP_PASS);

// Set up Mailtrap transport configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USER, // Add to your .env file
    pass: process.env.MAILTRAP_PASS, // Add to your .env file
  },
});

const sendMail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: '"YourApp" <noreply@yourapp.com>', // Replace with your app's info
      to,
      subject,
      text,
    });
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = sendMail;
