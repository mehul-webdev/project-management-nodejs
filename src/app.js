import express from "express";
import cookieParser from "cookie-parser";
import session from "express-session";
import cors from "cors";
import passport from "./config/passport.js";
import connectDB from "./config/db.js";
import routes from "./routes/index.js";
import morgan from "morgan";
import helmet from "helmet";
import dotenv from "dotenv";

dotenv.config();

// Initialize MongoDB
connectDB();

// Create Express app
const app = express();

// =============================
// 🔧 Middleware Configuration
// =============================
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(helmet());
app.use(express.json());
app.use(cookieParser());

// =============================
// 🌐 CORS Configuration
// =============================
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://projectmanagementnextjs.netlify.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed"));
      }
    },
    credentials: true, // <-- important for cookies
  })
);

// =============================
// 🧠 Session Configuration
// =============================
// Required for passport to serialize/deserialize user
app.use(
  session({
    name: "sid", // cookie name
    secret: process.env.SESSION_SECRET || "supersecretkey",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // true only on HTTPS
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
// 📦 Routes & Test Cookie
// =============================
app.use("/api", routes);

// Test cookie route
app.get("/test-cookie", (req, res) => {
  console.log("Cookies:", req.cookies);
  console.log("same site is", {
    secure: process.env.NODE_ENV === "production", // true only on HTTPS
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  res.json({
    cookies: req.cookies,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
});

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
