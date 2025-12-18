const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
      minlength: 6,
    },
    address: {
      type: String,
      default: "", // Delivery ke liye
    },
    phone: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["user", "admin", "restaurant"], // Future proofing (Admin panel ke liye)
      default: "user",
    },
  },
  {
    timestamps: true, // Ye automatically 'Created At' aur 'Updated At' time save karega
  }
);

// Password Hash karna (Save hone se pehle)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Password Verify karna (Login ke waqt)
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
