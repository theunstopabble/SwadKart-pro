const crypto = require("crypto");
const User = require("../models/userModel");
const generateToken = require("../utils/generateToken");
const sendEmail = require("../utils/sendEmail");

// =================================================================
// 🔐 AUTHENTICATION & USER PROFILE
// =================================================================

// @desc    Register a new user
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role || "user",
    });

    if (user) {
      try {
        await sendEmail({
          email: user.email,
          subject: "Welcome!",
          message: `Hi ${user.name}, Welcome to SwadKart!`,
        });
      } catch (err) {
        console.error("Email error:", err.message);
      }

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        description: user.description, // Return description
        image: user.image,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get User Profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        description: user.description,
        role: user.role,
        image: user.image,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update User Profile
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.image = req.body.image || user.image;
      user.phone = req.body.phone || user.phone;
      user.description = req.body.description || user.description;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        description: updatedUser.description,
        role: updatedUser.role,
        image: updatedUser.image,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =================================================================
// 🏙️ RESTAURANT PUBLIC DATA (Fixes 404 Error)
// =================================================================

// @desc    Get All Restaurants (Public)
const getAllRestaurantsPublic = async (req, res) => {
  try {
    const restaurants = await User.find({ role: "restaurant_owner" }).select(
      "-password"
    );
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Single Restaurant by ID (Public)
const getRestaurantById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "Restaurant not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =================================================================
// 👑 ADMIN FUNCTIONS
// =================================================================

const createDummyRestaurant = async (req, res) => {
  try {
    const { name, image } = req.body;
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const slug = name.toLowerCase().replace(/\s+/g, "");
    const dummyEmail = `${slug}_${randomSuffix}@dummy.swadkart`;

    const user = await User.create({
      name: name,
      email: dummyEmail,
      password: "dummy_password_hidden",
      phone: "9876543210",
      role: "restaurant_owner",
      image: image || "https://cdn-icons-png.flaticon.com/512/1996/1996068.png",
      description: "This is a dummy restaurant description.",
    });

    if (user)
      res.status(201).json({ message: "Dummy Shop Created", ...user._doc });
    else res.status(400).json({ message: "Invalid data" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await User.find({ role: "restaurant_owner" }).select(
      "-password"
    );
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createRestaurantByAdmin = async (req, res) => {
  try {
    const { name, email, password, image } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "Email exists" });

    const user = await User.create({
      name,
      email,
      password,
      role: "restaurant_owner",
      image: image || "https://cdn-icons-png.flaticon.com/512/1996/1996068.png",
    });
    if (user) res.status(201).json(user);
    else res.status(400).json({ message: "Invalid data" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUserByAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.name = req.body.name || user.name;
      user.image = req.body.image || user.image;
      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =================================================================
// 🔑 PASSWORD RESET
// =================================================================

const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // 👇 CRITICAL FIX: Live URL vs Local URL
    // Agar production (Live) hai to Vercel ka link, nahi to Localhost
    const frontendUrl =
      process.env.NODE_ENV === "production"
        ? "https://swadkart-pro.vercel.app" // Aapka Live Vercel Frontend
        : "http://localhost:5173";

    const resetUrl = `${frontendUrl}/password/reset/${resetToken}`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Password Reset Request",
        message: `You requested a password reset. Please click the link below to reset your password:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`,
      });
      res
        .status(200)
        .json({ success: true, message: `Email sent to ${user.email}` });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ message: "Email failed" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or Expired Token" });
    if (req.body.password !== req.body.confirmPassword)
      return res.status(400).json({ message: "Passwords do not match" });

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res
      .status(200)
      .json({ success: true, message: "Password Updated Successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDeliveryPartners = async (req, res) => {
  try {
    

    const partners = await User.find({ role: "delivery_partner" }).select(
      "-password"
    );
    
    res.json(partners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const seedDatabase = async (req, res) => {
  try {
    res.json({ message: "Seed function placeholder" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  resetPassword,
  getDeliveryPartners,
  getAllRestaurants,
  getAllRestaurantsPublic,
  getRestaurantById,
  createRestaurantByAdmin,
  createDummyRestaurant,
  seedDatabase,
  updateUserByAdmin,
};
