import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";

import * as userController from "../controllers/user.controller.js";

const router = express.Router();

router.get("/list", authMiddleware, userController.usersList);
router.delete("/:userId", authMiddleware, userController.deleteUser);
router.patch("/:userId", authMiddleware, userController.updateUser);

export default router;
