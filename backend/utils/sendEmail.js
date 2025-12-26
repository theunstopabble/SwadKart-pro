import nodeMailer from "nodemailer";

const sendEmail = async (options) => {
  console.log("📨 Email Sending Started...");

  const transporter = nodeMailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false, // 👈 KEY FIX for Render Cloud
    },
  });

  const mailOptions = {
    from: process.env.SMTP_MAIL,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  try {
    console.log("🚀 Attempting to send email...");
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email Sent Successfully! ID: " + info.messageId);
  } catch (error) {
    console.error("❌ EMAIL FAILED:", error.message);
    throw new Error(error.message);
  }
};

export default sendEmail;
