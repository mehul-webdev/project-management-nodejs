import express from "express";
import cookieParser from "cookie-parser";
import routes from "./routes/index.js";
import connectDB from "./config/db.js";
import cors from "cors";
import session from "express-session";

connectDB();

import passport from "./config/passport.js";
import { updateTokenMiddleware } from "./middlewares/updateTokenMiddleware.js";

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "keyboard cat",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // set true in production with HTTPS
  })
);

// initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api", routes);

// Middlewares
app.use(updateTokenMiddleware);

export default app;
