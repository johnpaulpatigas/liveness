import { Router } from "express";
import { authenticateApiKey } from "../middleware/auth.js";
import { validateIntegrity } from "../middleware/validateIntegrity.js";
import * as livenessController from "../controllers/liveness.controller.js";

const router = Router();

router.post("/enroll", authenticateApiKey, validateIntegrity, livenessController.enrollUser);
router.post("/verify", authenticateApiKey, validateIntegrity, livenessController.verifyUser);
router.post("/verify-one", authenticateApiKey, validateIntegrity, livenessController.verifyUserById);

export default router;