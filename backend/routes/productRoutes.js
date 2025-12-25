import express from "express";
const router = express.Router();

// 👇 .js एक्सटेंशन जोड़ना बहुत ज़रूरी है
import {
  getProducts,
  getProductById,
  deleteProduct,
  createProduct,
  updateProduct,
  getProductsByRestaurant,
} from "../controllers/productController.js";

import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

// Public: Sab dekh sakte hain
router.route("/").get(getProducts);

// Public: Kisi specific restaurant ka menu dekhna
router.route("/restaurant/:id").get(getProductsByRestaurant);

// Sirf ADMIN hi naya item bana sakta hai
router.route("/").post(protect, authorizeRoles("admin"), createProduct);

router
  .route("/:id")
  .get(getProductById)
  .delete(protect, authorizeRoles("admin"), deleteProduct)
  .put(protect, authorizeRoles("admin"), updateProduct);

// 👇 CHANGE: module.exports की जगह export default
export default router;
