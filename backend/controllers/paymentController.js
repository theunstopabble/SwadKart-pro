const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/orderModel");

/**
 * Razorpay Instance Helper
 * Isse function ke andar rakha gaya hai taaki environment variables
 * hamesha fresh load hon aur initialization error na aaye.
 */
const getRazorpayInstance = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// ============================================================
// 💳 PAYMENT CONTROLLER FUNCTIONS
// ============================================================

/**
 * @desc    Get Razorpay Key to Frontend
 * @route   GET /api/v1/payment/key
 * @access  Public/Private (As per your route setting)
 */
const getRazorpayKey = (req, res) => {
  res.status(200).json({
    key: process.env.RAZORPAY_KEY_ID,
  });
};

/**
 * @desc    Create Razorpay Order (Step 1)
 * @route   POST /api/v1/payment/create-order
 * @access  Private
 */
const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    const instance = getRazorpayInstance();

    const options = {
      amount: Number(amount * 100), // Razorpay amount paise mein leta hai (₹1 = 100 paise)
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await instance.orders.create(options);

    res.status(201).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Razorpay Order Creation Error:", error);
    res.status(500).json({
      success: false,
      message: "Payment initiation failed. Please check Razorpay keys in .env",
    });
  }
};

/**
 * @desc    Verify Payment Signature & Update DB (Step 2)
 * @route   POST /api/v1/payment/verify
 * @access  Private
 */
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId, // Frontend se bhejenge (MongoDB Order ID)
    } = req.body;

    // --- HMAC Signature Verification (Security Check) ---
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Payment verify ho gaya -> Order status update karein
      const order = await Order.findById(orderId);

      if (order) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
          id: razorpay_payment_id,
          status: "success",
          update_time: Date.now(),
        };

        const updatedOrder = await order.save();

        res.status(200).json({
          success: true,
          message: "Payment Verified & Order Updated",
          order: updatedOrder,
        });
      } else {
        res.status(404).json({
          success: false,
          message: "Order not found in database",
        });
      }
    } else {
      res.status(400).json({
        success: false,
        message: "Invalid Payment Signature (Security Breach!)",
      });
    }
  } catch (error) {
    console.error("Payment Verification Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error during payment verification",
    });
  }
};

module.exports = {
  createRazorpayOrder,
  verifyPayment,
  getRazorpayKey,
};
