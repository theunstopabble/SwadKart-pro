const Product = require("../models/productModel");

// ============================================================
// 👇 PUBLIC ROUTES
// ============================================================

const getProducts = async (req, res) => {
  try {
    const keyword = req.query.keyword
      ? { name: { $regex: req.query.keyword, $options: "i" } }
      : {};
    const products = await Product.find({ ...keyword });
    res.json({ products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404);
      throw new Error("Product not found");
    }
  } catch (error) {
    res.status(404).json({ message: "Product not found" });
  }
};

// 👇 IS FUNCTION KO FIX KIYA GAYA HAI
const getProductsByRestaurant = async (req, res) => {
  try {
    // 1. Debugging ke liye Console Log lagaya
    console.log("📥 Fetching Menu for Restaurant ID:", req.params.id);

    // 2. Database mein dhoondo (Restaurant ya User ID match ho)
    const products = await Product.find({
      $or: [{ restaurant: req.params.id }, { user: req.params.id }],
    });

    console.log(`✅ Found ${products.length} items for this shop.`);

    // 3. 👇 IMPORTANT FIX: Response ko Object mein wrap kiya
    // Taaki Frontend (response.data.products) isse padh sake
    res.json({ products });
  } catch (error) {
    console.error("❌ Error fetching menu:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// ============================================================
// 👇 ADMIN / OWNER ROUTES
// ============================================================

const createProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      description,
      image,
      category,
      countInStock,
      restaurantId,
    } = req.body;
    const ownerId = restaurantId || req.user._id;

    if (!ownerId) {
      return res
        .status(400)
        .json({ message: "Restaurant Owner ID is required" });
    }

    const product = new Product({
      name,
      price,
      description,
      image: image || "https://placehold.co/400",
      category,
      restaurant: ownerId, // Backend Link
      user: ownerId, // Frontend Link
      countInStock: countInStock || 100,
      numReviews: 0,
    });

    const createdProduct = await product.save();
    console.log("✅ New Item Created:", createdProduct.name);
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error("Product Create Error:", error);
    res.status(400).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      await product.deleteOne();
      res.json({ message: "Product removed" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { name, price, description, image, category, countInStock } =
      req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      product.price = price || product.price;
      product.description = description || product.description;
      product.image = image || product.image;
      product.category = category || product.category;
      product.countInStock = countInStock || product.countInStock;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  getProductsByRestaurant,
  createProduct,
  deleteProduct,
  updateProduct,
};
