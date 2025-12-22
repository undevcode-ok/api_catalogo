import { Router } from "express";
import healthRoutes from "./health.routes";

const router = Router();

router.get("/", (_req, res) => {
  res.json({ name: "catalog-backend", env: process.env.NODE_ENV ?? "development" });
});

router.use("/api", healthRoutes);

export default router;
