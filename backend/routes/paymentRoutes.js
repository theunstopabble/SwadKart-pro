const express = require("express");
const router = express.Router();
const {
  createRazorpayOrder,
  verifyPayment,
  getRazorpayKey,
} = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");

// ============================================================
// 💳 PAYMENT ROUTES
// ============================================================

/**
 * @route   GET /api/v1/payment/key
 * @desc    Get Razorpay Public Key
 * @access  Public (Removed 'protect' to fix 401 Unauthorized error)
 */
router.route("/key").get(getRazorpayKey);

/**
 * @route   POST /api/v1/payment/create-order
 * @desc    Create a new Razorpay Order ID
 * @access  Private (Requires Login)
 */
router.route("/create-order").post(protect, createRazorpayOrder);

/**
 * @route   POST /api/v1/payment/verify
 * @desc    Verify Payment Signature and update Order Status
 * @access  Private (Requires Login)
 */
router.route("/verify").post(protect, verifyPayment);

module.exports = router;
