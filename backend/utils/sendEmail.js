import nodeMailer from "nodemailer";

const sendEmail = async (options) => {
  console.log("📨 Email Sending Started...");
  console.log(`🔹 Sending to: ${options.email}`);

  const transporter = nodeMailer.createTransport({
    host: "smtp.gmail.com",
    port: 587, // 👈 Hardcoded: 465 hata diya, 587 best hai
    secure: false, // 👈 Hardcoded: 587 ke liye ye false hi hona chahiye
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
    // 👇 Ye settings server ko atakne nahi dengi (Timeout)
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });

  const mailOptions = {
    from: process.env.SMTP_MAIL,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  try {
    console.log("🚀 Connecting to Gmail...");
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email Sent! ID: " + info.messageId);
  } catch (error) {
    console.error("❌ EMAIL FAILED:", error.message);
    throw new Error(error.message); // Error wapas bhejo taaki controller pakad sake
  }
};

export default sendEmail;
