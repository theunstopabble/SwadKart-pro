import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";

import connectDB from "./config/db.js";
import { notFound, errorHandler } from "./middleware/authMiddleware.js";

// Routes Import
import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

// 👇 YAHAN DHYAN DO: Hum 'productRoutes' use karenge (FoodRoutes ki jagah)
import productRoutes from "./routes/productRoutes.js";

dotenv.config();
connectDB();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://swadkart-pro.vercel.app",
  "https://swadkart-pro.onrender.com",
  "https://swadkart-backend.onrender.com", // Safety ke liye ye bhi add kar lo
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Filhal sab allow (Dev mode fix)
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
};

app.use(cors(corsOptions));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: corsOptions,
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

io.on("connection", (socket) => {
  console.log("⚡ New Client Connected:", socket.id);
  socket.on("joinOrder", (orderId) => {
    socket.join(orderId);
  });
  socket.on("disconnect", () => {
    console.log("❌ Client Disconnected:", socket.id);
  });
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 🛤️ API ROUTES

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/payment", paymentRoutes);

// 👇 MAGIC LINE: Mobile App '/food' mangega, hum use 'productRoutes' denge
app.use("/api/v1/food", productRoutes);
// Agar website '/products' mange to bhi wahi file chalegi
app.use("/api/v1/products", productRoutes);

// ============================================================
// 📦 PRODUCTION SETUP
// ============================================================
app.get("/", (req, res) => {
  res.send("🚀 SwadKart API is running successfully...");
});
// ============================================================

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
