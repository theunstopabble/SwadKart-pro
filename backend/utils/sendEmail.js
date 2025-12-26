import nodeMailer from "nodemailer";

const sendEmail = async (options) => {
  console.log("📨 Email Sending Started (via Brevo Port 465)...");
  console.log(`🔹 Sending to: ${options.email}`);

  const transporter = nodeMailer.createTransport({
    host: "smtp-relay.brevo.com", // 👈 Hardcoded taaki galti na ho
    port: 465, // 👈 Port 465 (SSL) best hai
    secure: true, // 👈 465 ke liye True
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
    // Timeout logic taaki atke nahi
    connectionTimeout: 10000,
    greetingTimeout: 10000,
  });

  const mailOptions = {
    from: "SwadKart <swadkartt@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email Sent Successfully! ID: " + info.messageId);
  } catch (error) {
    console.error("❌ EMAIL FAILED:", error.message);
    throw new Error(error.message);
  }
};

export default sendEmail;
