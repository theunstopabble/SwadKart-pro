import nodeMailer from "nodemailer";

const sendEmail = async (options) => {
  const transporter = nodeMailer.createTransport({
    host: process.env.SMTP_HOST, // smtp.gmail.com
    port: process.env.SMTP_PORT, // 465
    service: process.env.SMTP_SERVICE, // gmail
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.SMTP_MAIL,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions);
};

// 👇 CHANGE: module.exports ki jagah export default
export default sendEmail;
