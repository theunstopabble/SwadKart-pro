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
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

dotenv.config();
connectDB();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://swadkart-pro.vercel.app",
  "https://swadkart-pro.onrender.com",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
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
    console.log(`👤 User joined order room: ${orderId}`);
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
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/payment", paymentRoutes);

app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);

// ============================================================
// 📦 PRODUCTION SETUP (Updated Fix for Node v22)
// ============================================================
const __dirname = path.resolve();

if (process.env.NODE_ENV === "production") {
  const distPath = path.join(__dirname, "frontend", "dist");
  app.use(express.static(distPath));

  // ✅ Fix: Use index.html for all non-API routes
  // Isse 'path-to-regexp' ka error nahi aayega
  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("🚀 SwadKart API is running with Socket.io...");
  });
}

// ============================================================

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.io is ready for real-time tracking`);
});
