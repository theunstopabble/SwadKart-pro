import express from "express";
const router = express.Router();

// 👇 Sabhi controllers ko import karein
import {
  registerUser,
  verifyEmailAPI, // 👈 NEW IMPORT (OTP Verify karne ke liye)
  loginUser,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  resetPassword,
  getAllRestaurantsPublic,
  getRestaurantById,
  getDeliveryPartners,
  getAllRestaurants,
  createRestaurantByAdmin,
  createDummyRestaurant,
  seedDatabase,
  updateUserByAdmin,
} from "../controllers/userController.js";

import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

// =================================================================
// 🔓 PUBLIC ROUTES
// =================================================================
router.post("/register", registerUser);
router.post("/verify-email", verifyEmailAPI); // 👈 NEW ROUTE (OTP Verification)
router.post("/login", loginUser);
router.post("/password/forgot", forgotPassword);
router.put("/password/reset/:token", resetPassword);

// Publicly restaurants dekhne ke liye
router.get("/restaurants", getAllRestaurantsPublic);

// =================================================================
// 🔐 PROTECTED ROUTES (Logged-in Users)
// =================================================================
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// =================================================================
// 👑 ADMIN ONLY ROUTES
// =================================================================
router.get("/admin/all", protect, authorizeRoles("admin"), getAllRestaurants);
router.get("/delivery-partners", protect, getDeliveryPartners);
router.post(
  "/admin/create-shop",
  protect,
  authorizeRoles("admin"),
  createRestaurantByAdmin
);
router.post(
  "/admin/create-dummy",
  protect,
  authorizeRoles("admin"),
  createDummyRestaurant
);
router.post("/admin/seed", protect, authorizeRoles("admin"), seedDatabase);
router.put(
  "/admin/user/:id",
  protect,
  authorizeRoles("admin"),
  updateUserByAdmin
);

// 👇 ID ROUTE (HAMESHA LAST MEIN)
router.get("/:id", getRestaurantById);

export default router;
