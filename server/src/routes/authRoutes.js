import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

const router = express.Router();

// Function to generate JWT
const generateToken = (id, role, department) => {
  return jwt.sign(
    { id, role, department },        // payload
    process.env.JWT_SECRET,          // secret key
    { expiresIn: "30d" }             // token validity
  );
};


// REGISTER 
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body; // allow role & department

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Only override role if role="authority" is passed
    let newUser;
    if (role === "authority") {
      newUser = new User({ name, email, password, role: "authority", department });
    } else {
      newUser = new User({ name, email, password, role: "citizen" });
    }

    await newUser.save();

    res.status(201).json({ 
      message: "User registered successfully",
      token: generateToken(newUser._id, newUser.role, newUser.department)
    });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// LOGIN 
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, password });  // no hashing
    if (!user) {
      return res.status(401).json({ message: "Invalid User Name or Password" });
    }

    res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department || null
      },
      token: generateToken(user._id, user.role, user.department)
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
