// 1. ENVIRONMENT VARIABLES LOADING (Must be first)
const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

// 2. ROUTE IMPORTS (After dotenv config)
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

// Connect to Database
connectDB();

const app = express();

// 3. MIDDLEWARE
app.use(express.json());
app.use(cors());

// ============================================================
// 4. API ROUTES
// ============================================================

app.use("/api/v1/products", productRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/payment", paymentRoutes);

// Map '/restaurants' to 'userRoutes'
app.use("/api/v1/restaurants", userRoutes);

// ============================================================
// 5. STATIC FILES & UPLOADS
// ============================================================
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("API is running...");
});

// ============================================================
// 6. ERROR HANDLING MIDDLEWARE
// ============================================================
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
