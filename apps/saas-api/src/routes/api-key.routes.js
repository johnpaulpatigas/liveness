import { Router } from "express";

import { authenticateToken } from "../middleware/auth.js";
import * as apiKeyController from "../controllers/api-key.controller.js";

const router = Router();

router.get("/", authenticateToken, apiKeyController.getApiKeys);
router.post("/", authenticateToken, apiKeyController.createApiKey);
router.delete("/:id", authenticateToken, apiKeyController.deleteApiKey);

export default router;
