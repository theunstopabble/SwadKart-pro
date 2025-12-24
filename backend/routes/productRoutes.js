const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductById,
  deleteProduct,
  createProduct,
  updateProduct,
  getProductsByRestaurant, // Make sure ye import ho
} = require("../controllers/productController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Public: Sab dekh sakte hain
router.route("/").get(getProducts);

// Public: Kisi specific restaurant ka menu dekhna
router.route("/restaurant/:id").get(getProductsByRestaurant);

// 👇 RESTRICTION APPLIED HERE
// Sirf ADMIN hi naya item bana sakta hai
router.route("/").post(protect, authorizeRoles("admin"), createProduct);

router
  .route("/:id")
  .get(getProductById)
  // 👇 Sirf ADMIN hi delete ya update kar sakta hai
  .delete(protect, authorizeRoles("admin"), deleteProduct)
  .put(protect, authorizeRoles("admin"), updateProduct);

module.exports = router;
