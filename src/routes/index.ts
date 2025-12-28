import { Router } from "express";
import authRoutes from "./auth.routes";
import catalogosRoutes from "./catalogos.routes";
import healthRoutes from "./health.routes";
import imagesRoutes from "./images.routes";
import itemsRoutes from "./items.routes";

const router = Router();

router.get("/", (_req, res) => {
  res.json({ name: "catalog-backend", env: process.env.NODE_ENV ?? "development" });
});

router.use("/api", healthRoutes);
router.use("/api/auth", authRoutes);
router.use("/api/catalogos", catalogosRoutes);
router.use("/api", imagesRoutes);
router.use("/api", itemsRoutes);

export default router;
