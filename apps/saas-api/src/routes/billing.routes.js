import { Router } from "express";

import { authenticateToken } from "../middleware/auth.js";
import * as billingController from "../controllers/billing.controller.js";

const router = Router();

router.get("/", authenticateToken, billingController.getBillingInfo);
router.post("/upgrade", authenticateToken, billingController.upgradeSubscriptionTier);

export default router;
