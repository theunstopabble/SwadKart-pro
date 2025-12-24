const mongoose = require("mongoose");

const restaurantSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    deliveryTime: {
      type: String,
    },

    // 👇 NEW FIELD: Sequence maintain karne ke liye (Drag & Drop)
    orderIndex: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Restaurant", restaurantSchema);
