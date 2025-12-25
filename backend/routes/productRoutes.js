import express from "express";
const router = express.Router();

// 👇 Controller functions import
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByRestaurant,
} from "../controllers/productController.js";

// 👇 Auth Middleware import
// (Make sure aapke authMiddleware.js me 'authorizeRoles' function ho,
// agar nahi hai to sirf 'protect, admin' use karein)
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

// ============================================================
// 👇 PUBLIC ROUTES (Bina Login ke access ho sakte hain)
// ============================================================

// 1. Saare products dekhna (Search ke sath)
router.route("/").get(getProducts);

// 2. Kisi specific Restaurant ka Menu dekhna (Mobile App ke liye Zaroori) 🟢
router.route("/restaurant/:id").get(getProductsByRestaurant);

// 3. Single Product ki details dekhna
router.route("/:id").get(getProductById);

// ============================================================
// 👇 PROTECTED ROUTES (Sirf Admin ya Restaurant Owner ke liye)
// ============================================================

// 1. Naya Khana (Product) Banana
router
  .route("/")
  .post(protect, authorizeRoles("admin", "restaurant_owner"), createProduct);

// 2. Product Update ya Delete karna
router
  .route("/:id")
  .put(protect, authorizeRoles("admin", "restaurant_owner"), updateProduct)
  .delete(protect, authorizeRoles("admin", "restaurant_owner"), deleteProduct);

export default router;
