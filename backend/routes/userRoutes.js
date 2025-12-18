const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/userController");

// URLs define kar rahe hain
router.post("/register", registerUser);
router.post("/login", loginUser);

module.exports = router;
