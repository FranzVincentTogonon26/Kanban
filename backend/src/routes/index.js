import express from "express";
import authRoutes from "./auth.route.js";
import boardRoutes from "./board.route.js";
import userRoutes from "./user.route.js";

const router = express.Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    status: "Healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

router.use("/auth", authRoutes);
router.use("/boards", boardRoutes);
router.use("/auth", userRoutes);

export default router;
