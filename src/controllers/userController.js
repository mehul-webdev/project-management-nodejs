import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { generateJWTToken } from "../utils/generateJWT.js";

export const handleGetUserDetails = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "User Found Successfully",
      user: {
        name: user.name,
        id: user._id,
        email: user.email,
        profilePicture: user.profilePicture,
        role: user.role,
      },
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

export const handleUpdateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.user.id; // from middleware

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.role = role;
    await user.save();

    res.status(200).json({
      message: "Role updated successfully",
      user: {
        name: user.name,
        id: user._id,
        email: user.email,
        profilePicture: user.profilePicture,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
