const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const router = express.Router();

// Razorpay Instance Setup
const instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET,
});

// 1. Order Create Karne Wala Route
router.post("/checkout", async (req, res) => {
  try {
    const options = {
      amount: Number(req.body.amount * 100), // Amount paise mein hona chahiye (500 INR = 50000 paise)
      currency: "INR",
    };
    const order = await instance.orders.create(options);

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Payment Error" });
  }
});

// 2. API Key Frontend ko bhejne wala route (Taaki frontend payment popup khol sake)
router.get("/getkey", (req, res) => {
  res.status(200).json({ key: process.env.RAZORPAY_API_KEY });
});

module.exports = router;
