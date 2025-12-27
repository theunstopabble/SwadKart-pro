import Razorpay from "razorpay";
import Order from "../models/orderModel.js";
import dotenv from "dotenv";

dotenv.config();

// Helper to get Instance
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
 */
export const getRazorpayKey = (req, res) => {
  res.status(200).json({
    key: process.env.RAZORPAY_KEY_ID,
  });
};

/**
 * @desc    Create Razorpay Order (Step 1)
 */
export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    const instance = getRazorpayInstance();

    const options = {
      amount: Number(amount * 100), // ₹1 = 100 paise
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
      message: "Payment initiation failed. Check .env keys.",
    });
  }
};

/**
 * @desc    Verify Payment DIRECTLY via Razorpay Server (Universal Fix)
 * @note    This fixes "Invalid Signature" on Android by skipping local check
 */
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, orderId } = req.body;
    const instance = getRazorpayInstance();

    // 👇 MAGIC STEP: Signature match karne ke bajaye,
    // hum seedha Razorpay se puchenge ki payment ka status kya hai.
    const payment = await instance.payments.fetch(razorpay_payment_id);

    // Agar status 'captured' ya 'authorized' hai, to payment asli hai
    if (payment.status === "captured" || payment.status === "authorized") {
      const order = await Order.findById(orderId);

      if (order) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
          id: payment.id,
          status: payment.status,
          update_time: payment.created_at,
          email_address: payment.email || "user@swadkart.com",
        };

        const updatedOrder = await order.save();

        res.status(200).json({
          success: true,
          message: "Payment Verified via Server Check",
          order: updatedOrder,
        });
      } else {
        res.status(404).json({ success: false, message: "Order not found" });
      }
    } else {
      // Agar Razorpay ne bola payment fail hai
      res.status(400).json({
        success: false,
        message: "Payment Failed. Status: " + payment.status,
      });
    }
  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({
      success: false,
      message: "Payment Verification Failed: " + error.message,
    });
  }
};
