const Restaurant = require("../models/restaurantModel");
const Item = require("../models/productModel"); // 👈 FIX: 'itemModel' ki jagah 'productModel'

// @desc    Get all restaurants
// @route   GET /api/v1/restaurants
const getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({}).sort({ createdAt: -1 });
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get single restaurant
// @route   GET /api/v1/restaurants/:id
const getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (restaurant) {
      res.json(restaurant);
    } else {
      res.status(404).json({ message: "Restaurant not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Menu Items by Restaurant ID
// @route   GET /api/v1/restaurants/menu/:id
const getMenuByRestaurantId = async (req, res) => {
  try {
    // Note: Shayad productModel mein 'restaurant' field ka naam 'restaurantId' ya 'restaurant' ho sakta hai.
    // Hum standard 'restaurant' use kar rahe hain.
    const items = await Item.find({ restaurant: req.params.id });
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching menu" });
  }
};

module.exports = {
  getAllRestaurants,
  getRestaurantById,
  getMenuByRestaurantId,
};
