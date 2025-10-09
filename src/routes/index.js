import { Router } from "express";
import dotenv from "dotenv";

dotenv.config();

import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/user", userRoutes);

export default router;
