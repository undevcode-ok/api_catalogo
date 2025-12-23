import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import { create, downloadPdf, getById, list, removeById, updateById } from "../controllers/catalogosController";

const router = Router();

router.use(authMiddleware);

router.post("/", create);
router.get("/", list);
router.get("/:id", getById);
router.get("/:id/pdf", downloadPdf);
router.put("/:id", updateById);
router.delete("/:id", removeById);

export default router;
