// frontend/src/config.js
export const BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:8000"
    : "https://swadkart-backend.onrender.com";
