import Razorpay from "razorpay";
import crypto from "crypto";
import Order from "../models/orderModel.js"; // .js लगाना ज़रूरी है

/**
 * Razorpay Instance Helper
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
      message: "Payment initiation failed. Please check Razorpay keys in .env",
    });
  }
};

/**
 * @desc    Verify Payment Signature & Update DB (Step 2)
 */
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
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
        message: "Invalid Payment Signature",
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
