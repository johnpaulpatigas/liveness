import { Router } from "express";
import * as changePasswordController from "../controllers/change-password.controller.js";
import { authenticateToken } from "../middleware/auth.js";
const router = Router();

router.post("/", authenticateToken, changePasswordController.changePassword);

export default router;
