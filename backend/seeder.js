const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const Restaurant = require("./models/restaurantModel");
const Product = require("./models/productModel");

dotenv.config();
connectDB();

const importData = async () => {
  try {
    // 1. Purana Data Saaf Karo
    await Restaurant.deleteMany();
    await Product.deleteMany();
    console.log("🧹 Purana data saaf kiya...");

    // 2. RESTAURANTS Create Karo
    const createdRestaurants = await Restaurant.insertMany([
      {
        name: "Pizza Hut",
        image:
          "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=2070&auto=format&fit=crop",
        description:
          "Best Pizza in Town. Cheese burst, Pepperoni aur bahut kuch!",
        address: "Block A, Connaught Place, New Delhi",
        deliveryTime: "30-40 min",
        rating: 4.5,
      },
      {
        name: "Burger King",
        image:
          "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1899&auto=format&fit=crop",
        description: "Juicy Whoppers aur Crispy Fries.",
        address: "Sector 18, Noida, UP",
        deliveryTime: "25-30 min",
        rating: 4.2,
      },
      {
        name: "KFC",
        image:
          "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=2070&auto=format&fit=crop",
        description: "World's Best Fried Chicken.",
        address: "Mall of India, Gurgaon",
        deliveryTime: "35-45 min",
        rating: 4.1,
      },
      {
        name: "Subway",
        image:
          "https://images.unsplash.com/photo-1619860860774-1445060bc03e?q=80&w=1974&auto=format&fit=crop", // Updated Image
        description: "Eat Fresh. Healthy Subs and Salads.",
        address: "Cyber City, DLF Phase 2",
        deliveryTime: "20-25 min",
        rating: 4.3,
      },
      {
        name: "Baskin Robbins",
        image:
          "https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=1974&auto=format&fit=crop",
        description: "31 Flavors of Ice Cream.",
        address: "Rajouri Garden, West Delhi",
        deliveryTime: "15-20 min",
        rating: 4.8,
      },
    ]);

    // IDs nikalo taaki products link kar sakein
    const pizzaHut = createdRestaurants[0]._id;
    const burgerKing = createdRestaurants[1]._id;
    const kfc = createdRestaurants[2]._id;
    const subway = createdRestaurants[3]._id;
    const baskin = createdRestaurants[4]._id;

    // 3. PRODUCTS Create Karo (Har product ko sahi dukaan se jodo)
    const products = [
      // 🍕 Pizza Hut Items
      {
        name: "Farmhouse Pizza",
        image:
          "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80",
        description:
          "Delightful combination of onion, capsicum, tomato & grilled mushroom.",
        category: "Pizza",
        price: 399,
        restaurant: pizzaHut, // Linked to Pizza Hut
      },
      {
        name: "Margherita Pizza",
        image:
          "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80",
        description: "Classic cheese pizza with basil.",
        category: "Pizza",
        price: 249,
        restaurant: pizzaHut,
      },

      // 🍔 Burger King Items
      {
        name: "Chicken Whopper",
        image:
          "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=800&q=80",
        description: "Flame grilled chicken patty with fresh veggies.",
        category: "Burger",
        price: 199,
        restaurant: burgerKing,
      },
      {
        name: "Veggie Strips",
        image:
          "https://images.unsplash.com/photo-1629814249159-e1f9a8cf8856?auto=format&fit=crop&w=800&q=80",
        description: "Crispy vegetable strips with spicy dip.",
        category: "Snacks",
        price: 99,
        restaurant: burgerKing,
      },

      // 🍗 KFC Items
      {
        name: "Chicken Bucket (8pc)",
        image:
          "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=800&q=80",
        description: "8 pieces of hot & crispy chicken.",
        category: "Chicken",
        price: 699,
        restaurant: kfc,
      },

      // 🥪 Subway Items
      {
        name: "Paneer Tikka Sub",
        image:
          "https://images.unsplash.com/photo-1619860860774-1445060bc03e?auto=format&fit=crop&w=800&q=80",
        description: "Spicy paneer tikka with fresh veggies and sauces.",
        category: "Sub",
        price: 229,
        restaurant: subway,
      },

      // 🍦 Baskin Robbins Items
      {
        name: "Chocolate Fudge Sundae",
        image:
          "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80",
        description: "Rich chocolate ice cream with hot fudge.",
        category: "Ice Cream",
        price: 149,
        restaurant: baskin,
      },
    ];

    await Product.insertMany(products);
    console.log("✅ Menu Setup Complete! Shops aur Khana link ho gaye.");

    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

importData();
