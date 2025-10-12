import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import { generateJWTToken } from "../utils/generateJWT.js";
import { setAuthCookie } from "../utils/setAuthCookie.js";

/**
 * 🧾 Get logged-in user details
 */
export const handleGetUserDetails = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res
        .status(401)
        .json({ message: "No authentication token provided" });
    }

    // Verify and decode JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user
    const user = await User.findById(decoded.id).select(
      "name email profilePicture role"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "User retrieved successfully",
      user,
    });
  } catch (err) {
    console.error("❌ Error in handleGetUserDetails:", err.message);
    const status = err.name === "JsonWebTokenError" ? 401 : 500;
    return res.status(status).json({
      message:
        err.name === "JsonWebTokenError"
          ? "Invalid or expired token"
          : "Server error",
      error: err.message,
    });
  }
};

/**
 * 🧠 Update user role and refresh JWT token
 */
export const handleUpdateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.user?.id; // populated by auth middleware

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized request" });
    }

    if (!role) {
      return res.status(400).json({ message: "Role is required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.role = role;
    await user.save();

    // Regenerate a new JWT with updated role
    const newToken = generateJWTToken(user._id, role);
    setAuthCookie(res, newToken);

    return res.status(200).json({
      message: "User role updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("❌ Error in handleUpdateUserRole:", err.message);
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};
