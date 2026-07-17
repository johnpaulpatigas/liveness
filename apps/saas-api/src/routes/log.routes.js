import { Router } from "express";

import { authenticateToken } from "../middleware/auth.js";
import * as logsController from "../controllers/log.controller.js";

const router = Router();

router.get("/", authenticateToken, logsController.getLogs);

export default router;
