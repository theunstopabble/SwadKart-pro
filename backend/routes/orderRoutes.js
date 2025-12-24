const express = require("express");
const router = express.Router();
const {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getMyOrders,
  getOrders,
  getAllOrdersAdmin,
  assignDeliveryPartner,
  getMyDeliveryOrders, // 👈 Import Added
} = require("../controllers/orderController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// ==================================================================
// 👇 SPECIFIC ROUTES (Inhein sabse UPAR rakhna zaroori hai)
// ==================================================================

// 1. User ki Order History
router.get("/myorders", protect, getMyOrders);

// 2. Admin ke liye Saare Orders
router.get("/admin/all", protect, authorizeRoles("admin"), getAllOrdersAdmin);

// 3. Delivery Partner ke Orders (Ye /:id se pehle aana chahiye!)
router.get(
  "/my-deliveries",
  protect,
  authorizeRoles("delivery_partner"),
  getMyDeliveryOrders
);

// ==================================================================
// 👇 GENERAL ROUTES
// ==================================================================

// 4. Root Route
router
  .route("/")
  .post(protect, addOrderItems)
  .get(protect, authorizeRoles("admin", "restaurant_owner"), getOrders);

// ==================================================================
// 👇 ID BASED ROUTES (Inhein neeche rakhein)
// ==================================================================

// 5. Order Payment Status
router.route("/:id/pay").put(protect, updateOrderToPaid);

// 6. Order Delivery Status
router
  .route("/:id/deliver")
  .put(
    protect,
    authorizeRoles("admin", "restaurant_owner", "delivery_partner"),
    updateOrderToDelivered
  );

// 7. Assign Delivery Partner
router
  .route("/:id/assign")
  .put(
    protect,
    authorizeRoles("admin", "restaurant_owner"),
    assignDeliveryPartner
  );

// 8. Get Single Order by ID (Ye Route SABSE LAST mein hona chahiye)
// Kyunki ye '/:id' kisi bhi string ko match kar leta hai
router.route("/:id").get(protect, getOrderById);

module.exports = router;
