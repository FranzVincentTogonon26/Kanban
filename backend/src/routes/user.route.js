import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";

import * as searchUsersController from "../controllers/user.controller.js";

const router = express.Router();

router.get("/search", authMiddleware, searchUsersController.searchUsers);

export default router;
