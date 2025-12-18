const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const Product = require("./models/productModel");

dotenv.config();
connectDB();

const products = [
  {
    name: "Maharaja Burger",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
    description: "Double patty, extra cheese, spicy sauce loaded burger.",
    category: "Fast Food",
    price: 199,
    countInStock: 10,
    rating: 4.5,
    numReviews: 12,
  },
  {
    name: "Paneer Tikka Pizza",
    image:
      "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80",
    description: "Spicy Paneer chunks with mozzarella cheese and onions.",
    category: "Pizza",
    price: 399,
    countInStock: 7,
    rating: 4.8,
    numReviews: 8,
  },
  {
    name: "Chicken Biryani",
    image:
      "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80",
    description: "Authentic Hyderabadi Dum Biryani with raita.",
    category: "Main Course",
    price: 249,
    countInStock: 15,
    rating: 4.9,
    numReviews: 20,
  },
  {
    name: "Masala Dosa",
    image:
      "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80",
    description: "Crispy rice crepe filled with spiced potatoes.",
    category: "South Indian",
    price: 149,
    countInStock: 5,
    rating: 4.3,
    numReviews: 10,
  },
  {
    name: "Choco Lava Cake",
    image:
      "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&w=800&q=80",
    description: "Molten chocolate cake for dessert lovers.",
    category: "Dessert",
    price: 99,
    countInStock: 20,
    rating: 4.7,
    numReviews: 15,
  },
  {
    name: "Momos Platter",
    image:
      "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80",
    description: "Steamed and fried momos with spicy red chutney.",
    category: "Chinese",
    price: 129,
    countInStock: 12,
    rating: 4.6,
    numReviews: 18,
  },
];

const importData = async () => {
  try {
    await Product.deleteMany(); // Pehle purana kachra saaf karo
    await Product.insertMany(products); // Naya maal daalo

    console.log("✅ Data Imported Successfully!");
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

importData();
