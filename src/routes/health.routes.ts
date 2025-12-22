import { Router } from "express";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ ok: true, uptime: process.uptime(), timestamp: Date.now() });
});

export default router;
