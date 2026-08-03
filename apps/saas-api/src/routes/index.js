import { Router } from "express";

import dashboardRoutes from "./dashboard.routes.js";
import livenessRoutes from "./liveness.routes.js";

const router = Router();

router.use("/dashboard", dashboardRoutes);
router.use("/liveness", livenessRoutes)

export default router;