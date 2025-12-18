const mongoose = require("mongoose");

const productSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    image: { type: String, required: true }, // Image ka URL
    description: { type: String, required: true },
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
    price: { type: Number, required: true, default: 0 },
    countInStock: { type: Number, required: true, default: 0 },
    category: { type: String, required: true }, // Veg/Non-Veg/Dessert
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);
