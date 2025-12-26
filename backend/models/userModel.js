import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    role: { type: String, required: true, default: "user" },
    image: { type: String },
    description: { type: String },

    // 👇 NEW FIELDS FOR OTP SECURITY (OTP Verification)
    isVerified: { type: Boolean, default: false }, // Login rokne ke liye
    otp: { type: String }, // Generated OTP store karne ke liye
    otpExpires: { type: Date }, // OTP expiry time ke liye

    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

// Password matching method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Hash password before saving
userSchema.pre("save", async function () {
  // Agar password modify nahi hua, toh yahin se wapas laut jao (return)
  if (!this.isModified("password")) {
    return;
  }

  // Agar modify hua hai, toh hash karo
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Reset password token generation
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 mins
  return resetToken;
};

const User = mongoose.model("User", userSchema);
export default User;
