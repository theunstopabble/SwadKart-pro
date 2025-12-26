import nodeMailer from "nodemailer";

const sendEmail = async (options) => {
  console.log("📨 Email Sending Started...");
  console.log(`🔹 Sending to: ${options.email}`);

  const transporter = nodeMailer.createTransport({
    host: "smtp.googlemail.com", // 👈 TRICK: Old hostname try kar rahe hain
    port: 587,
    secure: false, // Port 587 ke liye False
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
    // 👇 Security Policies ko bypass karne ke liye
    tls: {
      rejectUnauthorized: false,
      ciphers: "SSLv3",
    },
    // Timeout set kiya
    connectionTimeout: 10000,
  });

  const mailOptions = {
    from: process.env.SMTP_MAIL,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  try {
    console.log("🚀 Connecting to smtp.googlemail.com (Port 587)...");
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email Sent! ID: " + info.messageId);
  } catch (error) {
    console.error("❌ EMAIL FAILED:", error.message);
    throw new Error(error.message);
  }
};

export default sendEmail;
