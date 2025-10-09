import { Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import {
  handleRegister,
  handleLogout,
  handleLogin,
} from "../controllers/authController.js";
import { generateJWTToken } from "../utils/generateJWT.js";

const router = Router();

router.post("/register", handleRegister);
router.post("/login", handleLogin);
router.post("/logout", handleLogout);

// Google login
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google callback
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    const user = req.user;

    const userRole = user.role ? user.role : "";

    const token = generateJWTToken(user._id, userRole);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    if (userRole) {
      res.redirect("http://localhost:3000/dashboard");
    } else {
      res.redirect("http://localhost:3000/update-profile");
    }
  }
);

export default router;
