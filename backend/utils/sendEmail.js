import nodeMailer from "nodemailer";

const sendEmail = async (options) => {
  const transporter = nodeMailer.createTransport({
    host: process.env.SMTP_HOST, // smtp.gmail.com
    port: Number(process.env.SMTP_PORT), // 587 ya 465

    // 👇 Logic: Agar Port 465 hai to Secure=True, nahi to False (587 ke liye)
    secure: Number(process.env.SMTP_PORT) === 465,

    // ❌ 'service' line hata di hai taaki ye PORT ko ignore na kare

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

export default sendEmail;
