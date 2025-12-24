// frontend/src/config.js

// Vite automatically batata hai ki hum development mein hain ya production mein
export const BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:8000" // Jab Local chalaoge tab ye lega
    : "https://swadkart-backend.onrender.com"; // Jab Deploy hoga tab ye lega
