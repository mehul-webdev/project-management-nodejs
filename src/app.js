import express from "express";
import cookieParser from "cookie-parser";
import session from "express-session";
import cors from "cors";
import passport from "./config/passport.js";
import connectDB from "./config/db.js";
import routes from "./routes/index.js";
import { updateTokenMiddleware } from "./middlewares/updateTokenMiddleware.js";
import morgan from "morgan"; // For logging in dev
import helmet from "helmet"; // For security headers
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

// Initialize DB
connectDB();

// Create app
const app = express();

// =============================
// 🔧 Middleware Configuration
// =============================

// Logging (only in development)
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Security headers
app.use(helmet());

// Body & Cookie parsers
app.use(express.json());
app.use(cookieParser());

// =============================
// 🌐 CORS Configuration
// =============================
const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim());

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// =============================
// 🧠 Session Configuration
// =============================
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // true for HTTPS
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  })
);

// =============================
// 🔐 Passport Configuration
// =============================
app.use(passport.initialize());
app.use(passport.session());

// =============================
// 📦 Routes & Middleware
// =============================
app.use("/api", routes);
app.use(updateTokenMiddleware);

// =============================
// ⚠️ Error Handling Middleware
// =============================
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export default app;
