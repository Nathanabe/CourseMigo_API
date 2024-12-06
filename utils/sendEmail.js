const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, message) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail", // You can also use "Yahoo", "Outlook", etc.
      auth: {
        user: process.env.EMAIL_USER, // Your email address from .env
        pass: process.env.EMAIL_PASS, // Your email password from .env
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender address
      to: email, // Recipient address
      subject, // Subject of the email
      text: message, // Email content (plain text)
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${email} successfully!`);
  } catch (error) {
    console.error("Error sending email:", error.message);
    throw new Error("Could not send email");
  }
};

module.exports = sendEmail;