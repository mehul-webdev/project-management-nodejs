import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import { generateJWTToken } from "../utils/generateJWT.js";

export const updateTokenMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    // No token → skip
    if (!token) return next();

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      // Invalid token → remove cookie
      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
      return next();
    }

    // Check that decoded token has id and role
    if (!decoded.id || decoded.role === undefined || decoded.role === null) {
      console.log(
        "[UpdateTokenMiddleware] Token missing id or role, clearing cookie"
      );
      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
      return next();
    }

    // Optional: refresh token if < 1 day remaining
    const now = Math.floor(Date.now() / 1000);
    const timeLeft = decoded.exp - now;

    const user = await User.findById(decoded.id);
    if (!user) {
      // User not found → remove cookie
      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
      return next();
    }

    // Refresh token if needed
    const newToken = generateJWTToken(user._id, user.role);
    res.cookie("token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    next();
  } catch (err) {
    console.error("[UpdateTokenMiddleware] Error:", err);
    next();
  }
};
