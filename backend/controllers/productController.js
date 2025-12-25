import Product from "../models/productModel.js";

// ============================================================
// 👇 PUBLIC ROUTES (Sabke liye open)
// ============================================================

// @desc    Fetch all products (Search & Filter)
// @route   GET /api/v1/products
export const getProducts = async (req, res) => {
  try {
    const keyword = req.query.keyword
      ? { name: { $regex: req.query.keyword, $options: "i" } }
      : {};

    const products = await Product.find({ ...keyword });

    // Web frontend ke liye hum object bhejte hain, ye sahi hai
    res.json({ products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch single product by ID
// @route   GET /api/v1/products/:id
export const getProductById = async (req, res) => {
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

// 👇👇 IMPORTANT FIX FOR MOBILE APP 👇👇
// @desc    Fetch products by Restaurant ID
// @route   GET /api/v1/products/restaurant/:id
export const getProductsByRestaurant = async (req, res) => {
  try {
    console.log("📥 Fetching Menu for Restaurant ID:", req.params.id);

    // Restaurant ID ya User ID match hone par items lao
    const products = await Product.find({
      $or: [{ restaurant: req.params.id }, { user: req.params.id }],
    });

    console.log(`✅ Found ${products.length} items for this shop.`);

    // 🚨 FINAL FIX: Mobile App FlatList ko ARRAY chahiye, Object nahi.
    // Isliye curly braces {} hata diye hain.
    res.json(products);
  } catch (error) {
    console.error("❌ Error fetching menu:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// ============================================================
// 👇 PROTECTED ROUTES (Admin / Restaurant Owner Only)
// ============================================================

// @desc    Create a product
// @route   POST /api/v1/products
export const createProduct = async (req, res) => {
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

    // Agar Admin bana raha hai to restaurantId lega,
    // Agar Owner bana raha hai to khud ki ID use karega.
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
      restaurant: ownerId,
      user: ownerId,
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

// @desc    Delete a product
// @route   DELETE /api/v1/products/:id
export const deleteProduct = async (req, res) => {
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

// @desc    Update a product
// @route   PUT /api/v1/products/:id
export const updateProduct = async (req, res) => {
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
