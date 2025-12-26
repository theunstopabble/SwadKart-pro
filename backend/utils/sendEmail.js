// Universal Email Sender using Brevo API (Works on all Cloud Servers)
const sendEmail = async (options) => {
  console.log("📨 Email Sending Started (via Brevo API)...");
  console.log(`🔹 Sending to: ${options.email}`);

  const url = "https://api.brevo.com/v3/smtp/email";

  const data = {
    sender: {
      name: "SwadKart",
      email: "swadkartt@gmail.com", // Aapka Verified Sender Email
    },
    to: [
      {
        email: options.email,
        name: options.email.split("@")[0],
      },
    ],
    subject: options.subject,
    // Brevo API 'htmlContent' mangta hai, 'text' nahi.
    // Hum simple text ko HTML me wrap kar rahe hain:
    htmlContent: `
      <html>
        <body>
          <p>${options.message.replace(/\n/g, "<br>")}</p>
        </body>
      </html>`,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": process.env.BREVO_API_KEY, // 👈 Render Env se Key uthayega
        "content-type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "API Error");
    }

    console.log("✅ Email Sent Successfully via API!");
  } catch (error) {
    console.error("❌ EMAIL FAILED (API):", error.message);
    throw new Error(error.message);
  }
};

export default sendEmail;
