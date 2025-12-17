const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

// Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
  service: "Gmail",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD, 
  },
});


const sendMail = async (to, otp) => {
    await transporter.sendMail({
        from: process.env.EMAIL,
        to,
        subject: "Password Reset OTP",
        text: `Your OTP for password reset is ${otp}.` ,
    });
};

module.exports = { sendMail };