const express = require("express");
const dotenv = require("dotenv");
// Configuration Load
dotenv.config();
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const paymentRoutes = require("./routes/paymentRoutes"); // 1. Yahan Import kiya



// Database Connection Call
connectDB(); // 2. Yahan Connect kiya (App banne se pehle)

// App Initialize
const app = express();

// Middlewares
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
// Routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/payment", paymentRoutes);

// Test Route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to SwadKart API 🚀",
    status: "Active",
    mode: process.env.NODE_ENV || "development",
  });
});

// Server Listen
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`
  ################################################
  🚀 SwadKart Server Running on Port: ${PORT}
  🔗 URL: http://localhost:${PORT}
  ################################################
  `);
});