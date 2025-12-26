// Universal Email Sender using Brevo API (Works on all Cloud Servers)
const sendEmail = async (options) => {
  console.log("📨 Email Sending Started (via Brevo API)...");

  const url = "https://api.brevo.com/v3/smtp/email";

  // Agar humne full HTML template bheja hai to wo use kare, nahi to normal text wrap kare
  const htmlContent = options.html
    ? options.html
    : `<html><body><p>${options.message.replace(
        /\n/g,
        "<br>"
      )}</p></body></html>`;

  const data = {
    sender: {
      name: "SwadKart",
      email: "swadkartt@gmail.com", // Aapka verified sender
    },
    to: [
      {
        email: options.email,
        name: options.email.split("@")[0],
      },
    ],
    subject: options.subject,
    htmlContent: htmlContent, // 👈 Updated logic
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": process.env.BREVO_API_KEY,
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
    // Error ko throw nahi karenge taaki code crash na ho (Welcome email critical nahi hota)
  }
};

export default sendEmail;
