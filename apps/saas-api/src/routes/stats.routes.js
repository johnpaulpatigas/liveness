import { Router } from "express";

import { authenticateToken } from "../middleware/auth.js";
import * as statsController from "../controllers/stats.controller.js";

const router = Router();

router.get("/", authenticateToken, statsController.getStats);

export default router;
