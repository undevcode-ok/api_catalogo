import { Router } from "express";
import authRoutes from "./auth.routes";
import healthRoutes from "./health.routes";

const router = Router();

router.get("/", (_req, res) => {
  res.json({ name: "catalog-backend", env: process.env.NODE_ENV ?? "development" });
});

router.use("/api", healthRoutes);
router.use("/api/auth", authRoutes);

export default router;
