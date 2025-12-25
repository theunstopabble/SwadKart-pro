import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String },
    phone: { type: String },

    // Description Field
    description: { type: String, default: "" },

    role: { type: String, required: true, default: "user" },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

// Match Password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Password Hashing Middleware
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Generate Reset Token
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model("User", userSchema);

// 👇 CHANGE: module.exports hata kar export default lagaya
export default User;
