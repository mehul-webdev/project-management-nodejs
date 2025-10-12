import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import { generateJWTToken } from "../utils/generateJWT.js";
import { setAuthCookie, clearAuthCookie } from "../utils/setAuthCookie.js";

/**
 * 🧾 Register a New User
 */
export const handleRegister = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    // Basic validation
    if (!email || !password || !role) {
      return res
        .status(400)
        .json({ message: "Email, password, and role are required." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    const fullName = `${firstName || ""} ${lastName || ""}`.trim();

    const user = await User.create({
      email,
      password,
      name: fullName || email.split("@")[0],
      provider: "local",
      role,
    });

    const token = generateJWTToken(user._id, user.role);
    setAuthCookie(res, token);

    return res.status(201).json({
      message: "User registered successfully.",
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Register Error:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

/**
 * 🔑 Login Existing User
 */
export const handleLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found. Please register first." });
    }

    if (user.provider !== "local") {
      return res.status(401).json({
        message: `You have registered using ${user.provider} account.`,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = generateJWTToken(user._id, user.role);
    setAuthCookie(res, token);

    return res.status(200).json({
      message: "Login successful.",
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Login Error:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

/**
 * 🚪 Logout User
 */
export const handleLogout = async (req, res) => {
  try {
    clearAuthCookie(res);
    return res.status(200).json({ message: "Logged out successfully." });
  } catch (err) {
    console.error("Logout Error:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};
