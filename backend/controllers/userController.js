import crypto from "crypto";
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";
import sendEmail from "../utils/sendEmail.js";

// ==========================================
// 🎨 SHARED EMAIL STYLES (Site Theme)
// ==========================================
const emailStyles = `
  <style>
    body { font-family: 'Arial', sans-serif; background-color: #000000; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background-color: #111827; border-radius: 16px; overflow: hidden; border: 1px solid #1f2937; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    .header { background-color: #000000; padding: 35px; text-align: center; border-bottom: 1px solid #1f2937; }
    .logo-text { font-size: 38px; font-weight: 800; margin: 0; letter-spacing: -1.5px; }
    .swad { color: #ff4757; } 
    .kart { color: #ffffff; }
    .content { padding: 40px; color: #d1d5db; line-height: 1.8; text-align: center; }
    .otp-box { background-color: #000000; color: #ff4757; font-size: 36px; font-weight: bold; letter-spacing: 8px; padding: 20px; border-radius: 12px; margin: 25px 0; border: 1px dashed #ff4757; display: inline-block; width: 75%; }
    .cta-button { display: inline-block; background-color: #ff4757; color: #ffffff !important; text-decoration: none; padding: 14px 35px; border-radius: 12px; font-weight: bold; font-size: 18px; margin-top: 25px; transition: 0.3s; }
    .footer { background-color: #000000; color: #6b7280; text-align: center; padding: 25px; font-size: 12px; border-top: 1px solid #1f2937; }
  </style>
`;

// =================================================================
// 🔐 AUTHENTICATION & USER PROFILE
// =================================================================

// @desc    Register a new user & Send OTP
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: "🚫 All fields are mandatory!" });
    }

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000;

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role || "user",
      isVerified: false,
      otp,
      otpExpires,
    });

    if (user) {
      const otpTemplate = `
        <html>
        <head>${emailStyles}</head>
        <body>
          <div class="container">
            <div class="header">
              <h1 class="logo-text"><span class="swad">Swad</span><span class="kart">Kart</span> 🍔</h1>
            </div>
            <div class="content">
              <h2 style="color: #ffffff;">Verify Your Email</h2>
              <p>Hi ${
                user.name
              }, use the code below to securely verify your account. Valid for 10 minutes.</p>
              <div class="otp-box">${otp}</div>
              <p style="font-size: 13px; color: #9ca3af;">If you didn't request this, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} SwadKart. Made with ❤️ for Foodies</p>
            </div>
          </div>
        </body>
        </html>
      `;

      try {
        await sendEmail({
          email: user.email,
          subject: `🔐 ${otp} is your SwadKart Verification Code`,
          html: otpTemplate,
        });

        res
          .status(201)
          .json({ message: `OTP sent to ${user.email}`, email: user.email });
      } catch (err) {
        await User.findByIdAndDelete(user._id);
        return res
          .status(500)
          .json({ message: "Email failed to send. Try again." });
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP & Activate Account
export const verifyEmailAPI = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.otp === otp && user.otpExpires > Date.now()) {
      user.isVerified = true;
      user.otp = undefined;
      user.otpExpires = undefined;
      await user.save();

      const welcomeTemplate = `
        <html>
        <head>${emailStyles}</head>
        <body>
          <div class="container">
            <div class="header">
              <h1 class="logo-text"><span class="swad">Swad</span><span class="kart">Kart</span> 🍔</h1>
            </div>
            <div class="content">
              <h2 style="color: #ffffff;">Welcome to the Family, ${
                user.name
              }! 🎉</h2>
              <p>Your account is successfully verified. We are thrilled to have you as part of the SwadKart family.</p>
              <a href="https://swadkart-pro.vercel.app/login" class="cta-button">Order Your First Meal</a>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} SwadKart. Made with ❤️ for Foodies</p>
            </div>
          </div>
        </body>
        </html>
      `;

      sendEmail({
        email: user.email,
        subject: "Welcome to the Family! 🍔✨",
        html: welcomeTemplate,
      }).catch((err) => console.log("Welcome Email Error:", err.message));

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
        message: "✅ Email Verified!",
      });
    } else {
      res.status(400).json({ message: "❌ Invalid or Expired OTP" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login User & Get Token
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      if (!user.isVerified) {
        return res.status(401).json({ message: "🚫 Email not verified!" });
      }
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
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
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
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
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;
      if (req.body.password) user.password = req.body.password;
      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        token: generateToken(updatedUser._id),
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =================================================================
// 🔑 PASSWORD RESET
// =================================================================

// @desc    Send password reset email
export const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const frontendUrl =
      process.env.FRONTEND_URL || "https://swadkart-pro.vercel.app";
    const resetUrl = `${frontendUrl}/password/reset/${resetToken}`;

    const resetTemplate = `
      <html>
      <head>${emailStyles}</head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="logo-text"><span class="swad">Swad</span><span class="kart">Kart</span> 🍔</h1>
          </div>
          <div class="content">
            <h2 style="color: #ffffff;">Password Recovery</h2>
            <p>You requested a password reset. Click the button below to securely reset your password. Valid for 10 minutes.</p>
            <a href="${resetUrl}" class="cta-button">Reset Password</a>
            <p style="font-size: 13px; color: #9ca3af; margin-top: 25px;">If you didn't request this, ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} SwadKart. Made with ❤️ for Foodies</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: "SwadKart Password Recovery 🔐",
        html: resetTemplate,
      });
      res
        .status(200)
        .json({ success: true, message: `Reset link sent to ${user.email}` });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ message: "Email failed to send" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset password using token
export const resetPassword = async (req, res) => {
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

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ success: true, message: "Password Updated Successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =================================================================
// 🏙️ OTHER PUBLIC & ADMIN FUNCTIONS
// =================================================================

export const getAllRestaurantsPublic = async (req, res) => {
  try {
    const restaurants = await User.find({ role: "restaurant_owner" }).select(
      "-password"
    );
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRestaurantById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (user) res.json(user);
    else res.status(404).json({ message: "Restaurant not found" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createDummyRestaurant = async (req, res) => {
  try {
    const { name, image } = req.body;
    const user = await User.create({
      name,
      email: `${name.replace(/\s+/g, "")}@dummy.swadkart`,
      password: "dummy_password",
      role: "restaurant_owner",
      image,
      phone: "9111111111",
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await User.find({ role: "restaurant_owner" }).select(
      "-password"
    );
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDeliveryPartners = async (req, res) => {
  try {
    const partners = await User.find({ role: "delivery_partner" }).select(
      "-password"
    );
    res.json(partners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const seedDatabase = async (req, res) => {
  res.json({ message: "Seed placeholder" });
};
