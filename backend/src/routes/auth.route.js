import express from "express";
import * as authController from "../controllers/auth.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/signin", authController.signin);

// Protected Routes
router.get("/me", authMiddleware, authController.getCurrentUser);

export default router;
