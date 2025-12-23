import { Router } from "express";
import { ApiError } from "../utils/ApiError";
import { sequelize } from "../config/database";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ ok: true, uptime: process.uptime(), timestamp: Date.now() });
});

router.get("/health/db", async (_req, res, next) => {
  try {
    await sequelize.authenticate();
    res.json({ ok: true });
  } catch (error) {
    next(new ApiError(500, "Falló la conexión a la base de datos", { cause: String(error) }));
  }
});

export default router;
