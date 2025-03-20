import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authRoute = express.Router();

// Helper function to generate tokens
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "15h" } // Access token expires in 15 minutes
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.REFRESH_SECRET,
    { expiresIn: "7d" } // Refresh token expires in 7 days
  );
};

// Register User
authRoute.post("/register", async (req, res) => {
  console.log("Register endpoint hit!");
  const { name, email, password, role } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ name, email, password: hashedPassword, role });
    await user.save();

    console.log("User registered:", user);
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    res.status(201).json({
      message: "User registered successfully",
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Error in Register:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Login User
// Login User
authRoute.post("/login", async (req, res) => {
  console.log("Login endpoint hit!");
  const { email, password } = req.body;

  try {
    // Find user in database
    const user = await User.findOne({ email });
    console.log("User found:", user);

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate Tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // 🔹 Store refreshToken as HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });

    console.log("User logged in successfully");

    res.json({
      message: "Login successful",
      accessToken, // Send access token in response
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error in Login:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Logout User
authRoute.post("/logout", (req, res) => {
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out successfully" });
});

// Refresh Token Endpoint
authRoute.post("/refresh", (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    jwt.verify(refreshToken, process.env.REFRESH_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Invalid Refresh Token" });
      }

      // Generate a new access token
      const newAccessToken = generateAccessToken({ _id: decoded.id });

      res.json({ accessToken: newAccessToken });
    });
  } catch (error) {
    console.error("Error in Refresh Token:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

export default authRoute;
