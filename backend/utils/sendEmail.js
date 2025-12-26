import nodeMailer from "nodemailer";

const sendEmail = async (options) => {
  console.log("📨 Email Sending Started (via Brevo)...");
  console.log(`🔹 Sending to: ${options.email}`);

  const transporter = nodeMailer.createTransport({
    host: process.env.SMTP_HOST, // smtp-relay.brevo.com
    port: Number(process.env.SMTP_PORT), // 587
    auth: {
      user: process.env.SMTP_MAIL, // Ye Brevo ka Login ID uthayega (Jo aapne Env me dala hai)
      pass: process.env.SMTP_PASSWORD, // Ye Brevo ki Key uthayega
    },
  });

  const mailOptions = {
    from: "SwadKart <swadkartt@gmail.com>", // 👈 Sender Name (Ye user ko dikhega)
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
