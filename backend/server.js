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

// Connect to MongoDB
connectDB();

const app = express();

// 🌐 Socket.io Setup
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "https://swadkart-pro.vercel.app"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Middleware: Controllers me Socket (req.io) use karne ke liye
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Socket Events
io.on("connection", (socket) => {
  console.log("⚡ New Client Connected:", socket.id);

  // Order Tracking Room (Customer particular order join karega)
  socket.on("joinOrder", (orderId) => {
    socket.join(orderId);
    console.log(`👤 User joined order room: ${orderId}`);
  });

  socket.on("disconnect", () => {
    console.log("❌ Client Disconnected:", socket.id);
  });
});

// Standard Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: ["http://localhost:5173", "https://swadkart-pro.vercel.app"],
    credentials: true,
  })
);

// ============================================================
// 🛤️ API ROUTES (v1 added for Frontend Compatibility)
// ============================================================

// Primary Routes (v1)
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/payment", paymentRoutes);

// Fallback Routes (Without v1)
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);

// ============================================================

// Static Files & Production setup
const __dirname = path.resolve();
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/dist")));
  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("🚀 SwadKart API is running with Socket.io...");
  });
}

// Error Handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Listen on httpServer (Not app.listen)
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.io is ready for real-time tracking`);
});
