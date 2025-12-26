import nodeMailer from "nodemailer";

const sendEmail = async (options) => {
  console.log("📨 Email Sending Started...");
  console.log(`🔹 Sending to: ${options.email}`);

  const transporter = nodeMailer.createTransport({
    // 👇 MAGIC FIX: Host/Port hataya, Service mode lagaya
    service: "gmail",
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
    // Timeout settings (Taaki server atke nahi)
    connectionTimeout: 10000,
    greetingTimeout: 10000,
  });

  const mailOptions = {
    from: process.env.SMTP_MAIL,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  try {
    console.log("🚀 Connecting to Gmail via Service Mode...");
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email Sent! ID: " + info.messageId);
  } catch (error) {
    console.error("❌ EMAIL FAILED:", error.message);
    throw new Error(error.message);
  }
};

export default sendEmail;
