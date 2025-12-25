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

// Connect to Database
connectDB();

const app = express();

// 🌐 CORS Configuration (Local + Production)
const allowedOrigins = [
  "http://localhost:5173", // Vite Local
  "https://swadkart-pro.vercel.app", // Frontend Live (Vercel)
  "https://swadkart-pro.onrender.com", // Backend Live (Render) - अपनी URL यहाँ डालें
];

const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
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

// 🚀 Socket.io Setup
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: corsOptions, // Wahi settings socket ke liye bhi use karein
});

// Middleware: Controllers me Socket use karne ke liye
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Socket Events
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

// ============================================================
// 🛤️ API ROUTES (v1 and Fallback)
// ============================================================
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/payment", paymentRoutes);

// Backup routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);

// ============================================================
// 📦 PRODUCTION SETUP (Static Files)
// ============================================================
const __dirname = path.resolve();

if (process.env.NODE_ENV === "production") {
  // Frontend 'dist' folder ko static serve karein
  app.use(express.static(path.join(__dirname, "/frontend/dist")));

  // 🛡️ Render Fix: '*' ki jagah '/*' use karein
  app.get("/*", (req, res) =>
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("🚀 SwadKart API is running with Socket.io...");
  });
}

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// httpServer se start karein (Socket.io ke liye zaroori hai)
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.io is ready for real-time tracking`);
});
