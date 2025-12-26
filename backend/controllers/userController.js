import crypto from "crypto";
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";
import sendEmail from "../utils/sendEmail.js";

// =================================================================
// 🔐 AUTHENTICATION & USER PROFILE
// =================================================================

// @desc    Register a new user & Send OTP
// @route   POST /api/v1/users/register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // 1️⃣ MANDATORY FIELD CHECK
    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        message: "🚫 All fields are mandatory!",
      });
    }

    // 2️⃣ STRICT PHONE VALIDATION
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        message:
          "🚫 Invalid Phone Number! Must start with 6-9 and be 10 digits.",
      });
    }

    // 3️⃣ STRICT GMAIL CHECK
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(email)) {
      return res.status(400).json({
        message: "🚫 Only official Gmail accounts are allowed.",
      });
    }

    // 4️⃣ CHECK IF USER ALREADY EXISTS
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 5️⃣ GENERATE 6-DIGIT OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 Minutes expiry

    // 6️⃣ CREATE USER (Unverified)
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
      // 💌 SEND OTP EMAIL
      const message = `
      Hi ${user.name},
      
      Verify your SwadKart account! 🍔
      
      Your OTP is: ${otp}
      
      This code is valid for 10 minutes.
      If you verify this, you confirm that ${user.email} belongs to you.
      `;

      try {
        console.log("📨 Sending OTP to:", user.email);
        await sendEmail({
          email: user.email,
          subject: "SwadKart Verification OTP 🔐",
          message, // Ye simple text jayega
        });

        // ✅ Success Response
        res.status(201).json({
          message: `OTP sent to ${user.email}. Please verify to login.`,
          email: user.email,
        });
      } catch (emailError) {
        // ❌ AGAR EMAIL FAIL HUA, TO USER DELETE KARO
        console.error("❌ Email Failed! Deleting user to allow retry...");
        console.error(emailError);

        await User.findByIdAndDelete(user._id); // Cleanup

        return res.status(500).json({
          message:
            "Email sending failed. Please check your email address or try again later.",
        });
      }
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP & Activate Account (With Professional Email)
// @route   POST /api/v1/users/verify-email
export const verifyEmailAPI = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isVerified) {
      return res
        .status(200)
        .json({ message: "Account already verified. Please Login." });
    }

    if (user.otp === otp && user.otpExpires > Date.now()) {
      user.isVerified = true;
      user.otp = undefined;
      user.otpExpires = undefined;
      await user.save();

      // 🎉 PROFESSIONAL WELCOME EMAIL TEMPLATE (Zomato Style)
      const loginUrl = "https://swadkart-pro.vercel.app/login"; // Aapka Frontend Link

      const loginUrl = "https://swadkart-pro.vercel.app/login";

      const emailTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Arial', sans-serif; background-color: #000000; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background-color: #111827; border-radius: 16px; overflow: hidden; border: 1px solid #1f2937; }
            
            /* Logo Style matching: Swad (Red) Kart (White) with Tight Tracking */
            .header { background-color: #000000; padding: 40px 20px; text-align: center; border-bottom: 1px solid #1f2937; }
            .logo { font-size: 38px; font-weight: 800; margin: 0; letter-spacing: -1.5px; } /* letter-spacing is for tracking-tight */
            .swad { color: #ff4757; } 
            .kart { color: #ffffff; }
            
            .content { padding: 40px; color: #d1d5db; line-height: 1.8; text-align: center; }
            .cta-button { display: inline-block; background-color: #ff4757; color: #ffffff !important; text-decoration: none; padding: 14px 35px; border-radius: 12px; font-weight: bold; font-size: 18px; margin-top: 25px; }
            
            .footer { background-color: #000000; color: #6b7280; text-align: center; padding: 25px; font-size: 12px; border-top: 1px solid #1f2937; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 class="logo"><span class="swad">Swad</span><span class="kart">Kart</span></h1>
              <p style="color: #9ca3af; margin-top: 5px; font-size: 14px; letter-spacing: 0.5px;">Taste the Happiness!</p>
            </div>
            <div class="content">
              <h2 style="color: #ffffff; font-size: 24px;">Welcome to the Family, ${
                user.name
              }! 🎉</h2>
              <p>Your account is verified. Get ready for the fastest delivery and authentic flavors right at your doorstep.</p>
              
              <a href="${loginUrl}" class="cta-button">Order Now</a>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} SwadKart. All rights reserved.</p>
              <p>Made with ❤️ for Foodies</p>
            </div>
          </div>
        </body>
        </html>
      `;
      // Send Welcome Email (Non-blocking)
      sendEmail({
        email: user.email,
        subject: "Welcome to the Family! 🍔✨",
        html: emailTemplate, // 👈 Hum 'html' bhej rahe hain
      }).catch((err) => console.log("Welcome Email Error:", err.message));

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
        message: "✅ Email Verified! Welcome Email Sent.",
      });
    } else {
      res.status(400).json({ message: "❌ Invalid or Expired OTP" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login User & Get Token
// @route   POST /api/v1/users/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      // 🛑 BLOCK IF NOT VERIFIED
      if (!user.isVerified) {
        return res.status(401).json({
          message: "🚫 Email not verified! Please check your email for OTP.",
        });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        description: user.description,
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
// @route   GET /api/v1/users/profile
export const getUserProfile = async (req, res) => {
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
// @route   PUT /api/v1/users/profile
export const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.image = req.body.image || user.image;
      user.phone = req.body.phone || user.phone;
      user.description = req.body.description || user.description;

      // Only update password if provided and not empty
      if (req.body.password && req.body.password.trim() !== "") {
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
// 🏙️ RESTAURANT PUBLIC DATA
// =================================================================

// @desc    Get all restaurants for public view
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

// @desc    Get restaurant details by ID
export const getRestaurantById = async (req, res) => {
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

// @desc    Create a dummy restaurant (Admin only)
export const createDummyRestaurant = async (req, res) => {
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

// @desc    Get all restaurants (Admin only)
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

// @desc    Create restaurant account (Admin only)
export const createRestaurantByAdmin = async (req, res) => {
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

// @desc    Update restaurant info (Admin only)
export const updateUserByAdmin = async (req, res) => {
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

// @desc    Send password reset email
export const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // ✅ FIX: Use FRONTEND_URL from environment variables for reliable links
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetUrl = `${frontendUrl}/password/reset/${resetToken}`;

    const message = `You requested a password reset. Please click the link below to reset your password:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`;

    try {
      await sendEmail({
        email: user.email,
        subject: "SwadKart Password Recovery",
        message, // Utility will wrap this in simple HTML
      });

      res
        .status(200)
        .json({ success: true, message: `Email sent to ${user.email}` });
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
    if (req.body.password !== req.body.confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

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

// =================================================================
// 🛵 DELIVERY PARTNERS
// =================================================================

// @desc    Get all delivery partners
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

// Placeholder for database seeding
export const seedDatabase = async (req, res) => {
  try {
    res.json({ message: "Seed function placeholder" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
