const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  resetPassword,
  getAllRestaurantsPublic, // 👈 Frontend ke liye zaroori
  getRestaurantById, // 👈 Menu page ke liye zaroori
  getDeliveryPartners,
  getAllRestaurants,
  createRestaurantByAdmin,
  createDummyRestaurant,
  seedDatabase,
  updateUserByAdmin,
} = require("../controllers/userController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// =================================================================
// 🔓 PUBLIC ROUTES
// =================================================================
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/password/forgot", forgotPassword);
router.put("/password/reset/:token", resetPassword);

// 👇 CRITICAL FIX: Isse '/restaurants' karein aur sabse upar rakhein
// Taki server "restaurants" ko ID na samjhe.
router.get("/restaurants", getAllRestaurantsPublic);

// =================================================================
// 🔐 PROTECTED ROUTES (Logged-in Users)
// =================================================================
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// =================================================================
// 👑 ADMIN ONLY ROUTES
// =================================================================
router.get("/admin/all", protect, authorizeRoles("admin"), getAllRestaurants);
router.get("/delivery-partners", protect, getDeliveryPartners);
router.post(
  "/admin/create-shop",
  protect,
  authorizeRoles("admin"),
  createRestaurantByAdmin
);
router.post(
  "/admin/create-dummy",
  protect,
  authorizeRoles("admin"),
  createDummyRestaurant
);
router.post("/admin/seed", protect, authorizeRoles("admin"), seedDatabase);
router.put(
  "/admin/user/:id",
  protect,
  authorizeRoles("admin"),
  updateUserByAdmin
);

// 👇 ID ROUTE (YE HAMESHA LAST MEIN AANA CHAHIYE)
// Agar koi upar wala route match nahi hua, tab server isse ID maanta hai
router.get("/:id", getRestaurantById);

module.exports = router;
