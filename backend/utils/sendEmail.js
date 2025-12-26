import nodeMailer from "nodemailer";

const sendEmail = async (options) => {
  console.log("📨 Email Sending Started...");
  console.log(`🔹 Sending to: ${options.email}`);

  const transporter = nodeMailer.createTransport({
    host: "smtp.gmail.com",
    port: 465, // 👈 Port 465 (SSL)
    secure: true, // 👈 465 ke liye ye TRUE hona chahiye
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
    // Timeout thoda badha diya (20s)
    connectionTimeout: 20000,
    greetingTimeout: 20000,
  });

  const mailOptions = {
    from: process.env.SMTP_MAIL,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  try {
    console.log("🚀 Connecting to Gmail via Port 465...");
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email Sent! ID: " + info.messageId);
  } catch (error) {
    console.error("❌ EMAIL FAILED:", error.message);
    throw new Error(error.message);
  }
};

export default sendEmail;
