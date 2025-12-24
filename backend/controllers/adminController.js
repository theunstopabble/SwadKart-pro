const Restaurant = require("../models/restaurantModel");
const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const User = require("../models/userModel");

// 1. STATS
const getAdminStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalRestaurants = await Restaurant.countDocuments();
    const totalProducts = await Product.countDocuments();

    const orders = await Order.find({ isPaid: true });
    const totalRevenue = orders.reduce((acc, item) => acc + item.totalPrice, 0);

    const recentOrders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name email");

    res.json({
      totalOrders,
      totalUsers,
      totalRestaurants,
      totalProducts,
      totalRevenue,
      recentOrders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. GET ALL DATA (For Admin List)
const getAllData = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({});
    const products = await Product.find({}).populate("restaurant", "name");
    res.json({ restaurants, products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. RESTAURANT OPERATIONS
const addRestaurant = async (req, res) => {
  try {
    const restaurant = new Restaurant({ ...req.body, user: req.user._id });
    const saved = await restaurant.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateRestaurant = async (req, res) => {
  try {
    const updated = await Restaurant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteRestaurant = async (req, res) => {
  try {
    await Restaurant.findByIdAndDelete(req.params.id);
    res.json({ message: "Restaurant deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. PRODUCT OPERATIONS
const addProduct = async (req, res) => {
  try {
    // Frontend se 'restaurantId' aa raha hai, usse 'restaurant' field mein map karein
    const { restaurantId, ...rest } = req.body;
    const product = new Product({ ...rest, restaurant: restaurantId });
    const saved = await product.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Placeholder for reorder (To prevent crash)
const reorderData = async (req, res) => {
  res.json({ message: "Reorder feature coming soon" });
};

module.exports = {
  getAdminStats,
  getAllData,
  addRestaurant,
  updateRestaurant,
  deleteRestaurant,
  addProduct,
  updateProduct,
  deleteProduct,
  reorderData,
};
