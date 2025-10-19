import express from "express";
import cookieParser from "cookie-parser";
import session from "express-session";
import cors from "cors";
import passport from "./config/passport.js";
import connectDB from "./config/db.js";
import routes from "./routes/index.js";
import { updateTokenMiddleware } from "./middlewares/updateTokenMiddleware.js";
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
  "http://localhost:5173",
  "https://projectmanagementnextjs.netlify.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // important for cookies
  })
);

// =============================
// 🧠 Session Configuration
// =============================
// Required for passport to serialize/deserialize user
app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecretkey",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // true on HTTPS (Netlify)
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
// app.use(updateTokenMiddleware);

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
