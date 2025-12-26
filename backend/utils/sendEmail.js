import nodeMailer from "nodemailer";

const sendEmail = async (options) => {
  console.log("📨 Email Sending Started...");
  console.log(`🔹 Sending to: ${options.email}`);

  const transporter = nodeMailer.createTransport({
    // 👇 Service Mode (Port/Host ki chinta nahi)
    service: "gmail",
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
    // 👇👇👇 MAGIC FIX IS HERE 👇👇👇
    family: 4, // Ye Render ko IPv4 use karne par majboor karega
  });

  const mailOptions = {
    from: process.env.SMTP_MAIL,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  try {
    console.log("🚀 Connecting to Gmail (IPv4 Mode)...");
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email Sent! ID: " + info.messageId);
  } catch (error) {
    console.error("❌ EMAIL FAILED:", error.message);
    throw new Error(error.message);
  }
};

export default sendEmail;
