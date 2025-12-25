import express from "express";
const router = express.Router();

// 👇 Controller functions ko import karein (.js extension ke saath)
import {
  createRazorpayOrder,
  verifyPayment,
  getRazorpayKey,
} from "../controllers/paymentController.js";

import { protect } from "../middleware/authMiddleware.js";

// ============================================================
// 💳 PAYMENT ROUTES
// ============================================================

/**
 * @route   GET /api/v1/payment/key
 */
router.route("/key").get(getRazorpayKey);

/**
 * @route   POST /api/v1/payment/create-order
 */
router.route("/create-order").post(protect, createRazorpayOrder);

/**
 * @route   POST /api/v1/payment/verify
 */
router.route("/verify").post(protect, verifyPayment);

// 👇 CHANGE: module.exports ki jagah export default
export default router;
