import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import compression from "compression"; // 👈 SPEED: Data size chota karne ke liye
import { createServer } from "http";
import { Server } from "socket.io";

import connectDB from "./config/db.js";
import { notFound, errorHandler } from "./middleware/authMiddleware.js";

// Routes Import
import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import productRoutes from "./routes/productRoutes.js";

dotenv.config();
connectDB(); // MongoDB connection fast wala logic yahan config/db.js mein hona chahiye

const app = express();

// 🚀 SPEED FIX: Sabse upar compression add karein
app.use(compression());

const allowedOrigins = [
  "http://localhost:5173",
  "https://swadkart-pro.vercel.app",
  "https://swadkart-pro.onrender.com",
  "https://swadkart-backend.onrender.com",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true);
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

// Socket logic
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

// 🛌 RENDER KEEP-AWAKE: Ye route Render ko sone nahi dega
app.get("/ping", (req, res) => res.status(200).send("I am awake!"));

// 🛤️ API ROUTES
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/food", productRoutes);
app.use("/api/v1/products", productRoutes);

app.get("/", (req, res) => {
  res.send("🚀 SwadKart API is running successfully...");
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
