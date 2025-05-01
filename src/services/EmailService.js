import nodemailer from "nodemailer";
import dotenv from "dotenv"; 
dotenv.config(); 

const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAILID,
    pass: process.env.PASS,
  },
});

const sendMail = async (toEmail, subject, htmlContent) => {
  const mailOptions = {
    from: process.env.MAILID,
    to: [toEmail],
    subject,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`Error sending email to ${toEmail}: `, error);
  }
};

// Send Activation Email
const sendActivateEmail = async (userId, email) => {
  const link = `${process.env.APPLINK}/authenticate/${userId}`;
  const htmlContent = `
    <html>
      <body>
        <h1>Contact Manager</h1>
        <p>This is a verification email from your Contact Manager. Click the link below:</p>
        <a href="${link}">Activate your account &nbsp; </a>
        <h4>Note</h4>
        <p>Your account will not be activated until you click the link provided in this email.</p>
      </body>
    </html>
  `;
  await sendMail(email, "Activate your Contact Manager account ", htmlContent);
};

// Send Reset Password Email
const sendResetMail = async (token, email) => {
  const link = `${process.env.APPLINK}/resetPassword?token=${token}`;
  const htmlContent = `
    <html>
      <body>
        <h1>Contact Manager</h1>
        <p>You can reset your password using the link below:</p>
        <a href="${link}">Reset Password &nbsp; </a>
      </body>
    </html>
  `;
  await sendMail(email, "Reset your Contact Manager password ", htmlContent);
};

export default {
  sendActivateEmail,
  sendResetMail,
};
