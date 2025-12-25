import express from "express";
const router = express.Router();
import {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  updateOrderStatus, // 👈 New Function Import kiya
  getMyOrders,
  getOrders,
  getAllOrdersAdmin,
  assignDeliveryPartner,
  getMyDeliveryOrders,
} from "../controllers/orderController.js"; // Note: .js lagana zaroori hai

import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

// ==================================================================
// 👇 SPECIFIC ROUTES (Inhein sabse UPAR rakhna zaroori hai)
// ==================================================================

// 1. User ki Order History
router.route("/myorders").get(protect, getMyOrders);

// 2. Admin ke liye Saare Orders
router
  .route("/admin/all")
  .get(protect, authorizeRoles("admin"), getAllOrdersAdmin);

// 3. Delivery Partner ke Orders
router
  .route("/my-deliveries")
  .get(protect, authorizeRoles("delivery_partner"), getMyDeliveryOrders);

// ==================================================================
// 👇 GENERAL ROUTES
// ==================================================================

// 4. Root Route (Create & Get All)
router
  .route("/")
  .post(protect, addOrderItems)
  .get(protect, authorizeRoles("admin", "restaurant_owner"), getOrders);

// ==================================================================
// 👇 ID BASED ROUTES (Inhein neeche rakhein)
// ==================================================================

// 5. 🔥 NEW ROUTE: General Status Update (Cooking, Ready, etc.)
// Isme Socket.io laga hua hai controller mein
router
  .route("/:id/status")
  .put(protect, authorizeRoles("admin", "restaurant_owner"), updateOrderStatus);

// 6. Order Payment Status
router.route("/:id/pay").put(protect, updateOrderToPaid);

// 7. Order Delivery Status (Mark as Delivered)
router
  .route("/:id/deliver")
  .put(
    protect,
    authorizeRoles("admin", "restaurant_owner", "delivery_partner"),
    updateOrderToDelivered
  );

// 8. Assign Delivery Partner
router
  .route("/:id/assign")
  .put(
    protect,
    authorizeRoles("admin", "restaurant_owner"),
    assignDeliveryPartner
  );

// 9. Get Single Order by ID (Ye Route SABSE LAST mein hona chahiye)
router.route("/:id").get(protect, getOrderById);

export default router;
