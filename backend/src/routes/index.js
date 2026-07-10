import express from "express";
import authRoutes from "./auth.route.js";

const router = express.Router();

router.use("/auth", authRoutes);

router.get("/health", (req, res) => {
  res.status(200).json({
    status: "Healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default router;
