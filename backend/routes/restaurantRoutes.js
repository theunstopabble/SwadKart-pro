const express = require("express");
const router = express.Router();

const {
  getAllRestaurants,
  getRestaurantById,
  getMenuByRestaurantId, // 👈 Import new function
} = require("../controllers/restaurantController");

// Public Routes
router.get("/", getAllRestaurants);
router.get("/menu/:id", getMenuByRestaurantId); // 👈 Menu wala Route Add kiya
router.get("/:id", getRestaurantById); // ID wala hamesha last me rakhein

module.exports = router;
