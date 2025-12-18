/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#ff6b6b", // Neon Red/Orange
        secondary: "#1a1a1a", // Dark Black
      },
    },
  },
  plugins: [],
};
