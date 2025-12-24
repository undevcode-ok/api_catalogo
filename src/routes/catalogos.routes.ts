import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import { validateBody } from "../middlewares/validate";
import {
  createCatalogoSchema,
  updateCatalogoSchema
} from "../validations/catalogos.validation";
import { create, downloadPdf, getById, list, removeById, updateById } from "../controllers/catalogosController";

const router = Router();

router.use(authMiddleware);

router.post("/", validateBody(createCatalogoSchema), create);
router.get("/", list);
router.get("/:id", getById);
router.get("/:id/pdf", downloadPdf);
router.put("/:id", validateBody(updateCatalogoSchema), updateById);
router.delete("/:id", removeById);

export default router;
