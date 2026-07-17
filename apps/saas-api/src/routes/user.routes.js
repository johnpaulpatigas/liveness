import { Router } from "express";

import { authenticateToken } from "../middleware/auth.js";
import * as usersController from "../controllers/user.controller.js";

const router = Router();

router.get("/", authenticateToken, usersController.getUsers);
router.delete("/:id", authenticateToken, usersController.deleteUser);

export default router;
