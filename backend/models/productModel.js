import mongoose from "mongoose"; // 👈 require हटाकर import लगाया

const productSchema = mongoose.Schema(
  {
    // 👇 FIX 1: Ref ko 'User' karein (Kyunki Restaurant Owner ek User hai)
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 👇 FIX 2: 'user' field bhi add karein (Frontend compatibility ke liye)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },

    // Modern Features
    isVeg: {
      type: Boolean,
      default: true,
    },

    isRecommended: {
      type: Boolean,
      default: false,
    },

    countInStock: {
      type: Number,
      required: true,
      default: 100,
    },

    orderIndex: {
      type: Number,
      default: 0,
    },

    // Rating fields
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

// 👇 CHANGE: module.exports hata kar export default lagaya
export default Product;
