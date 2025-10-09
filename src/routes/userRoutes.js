import { Router } from "express";
import {
  handleGetUserDetails,
  handleUpdateUserRole,
} from "../controllers/userController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { updateTokenMiddleware } from "../middlewares/updateTokenMiddleware.js";

const router = Router();

router.get("/", handleGetUserDetails);
router.patch(
  "/update-role",
  authMiddleware,
  updateTokenMiddleware,
  handleUpdateUserRole
);

export default router;
