const express = require("express");
const router = express.Router();
const {
  addRestaurant,
  deleteRestaurant,
  updateRestaurant,
  addProduct,
  deleteProduct,
  updateProduct,
  getAllData,
  getAdminStats,
  reorderData,
} = require("../controllers/adminController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// 👇 GLOBAL MIDDLEWARE: Iske niche sab routes protected aur admin-only honge
router.use(protect, authorizeRoles("admin"));

// Stats Route
router.get("/stats", getAdminStats);

// Data Route (List lane ke liye)
router.get("/all", getAllData);

// Restaurant Routes
router.route("/restaurant").post(addRestaurant);
router.route("/restaurant/:id").delete(deleteRestaurant).put(updateRestaurant);

// Product Routes
router.route("/product").post(addProduct);
router.route("/product/:id").delete(deleteProduct).put(updateProduct);

// Reorder Route
router.put("/reorder", reorderData);

module.exports = router;
