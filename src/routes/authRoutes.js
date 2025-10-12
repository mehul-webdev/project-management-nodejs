import { Router } from "express";
import passport from "passport";
import {
  handleRegister,
  handleLogout,
  handleLogin,
} from "../controllers/authController.js";
import { generateJWTToken } from "../utils/generateJWT.js";

const router = Router();

// Manual Auth Routes
router.post("/register", handleRegister);
router.post("/login", handleLogin);
router.post("/logout", handleLogout);

// Google OAuth Login
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google OAuth Callback
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    const user = req.user;
    const userRole = user.role || "";

    const token = generateJWTToken(user._id, userRole);

    // Set JWT token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // use true for HTTPS
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // cross-site cookie support
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Redirect user based on role/profile completion
    const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
    const redirectPath = userRole ? "/dashboard" : "/update-profile";

    res.redirect(`${FRONTEND_URL}${redirectPath}`);
  }
);

export default router;
