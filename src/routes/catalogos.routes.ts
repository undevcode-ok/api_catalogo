import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import { validateBody } from "../middlewares/validate";
import { uploadMiddleware } from "../s3-image-module";
import {
  createCatalogoSchema,
  createCatalogoPdfFromHtmlSchema,
  updateCatalogoSchema
} from "../validations/catalogos.validation";
import {
  create,
  downloadPdf,
  downloadPdfFromHtml,
  getById,
  list,
  removeById,
  updateById
} from "../controllers/catalogosController";

const router = Router();

router.use(authMiddleware);

router.post("/", validateBody(createCatalogoSchema), create);
router.get("/", list);
router.get("/:id", getById);
router.get("/:id/pdf", downloadPdf);
router.post("/:id/pdf/html", validateBody(createCatalogoPdfFromHtmlSchema), downloadPdfFromHtml);
router.put("/:id", validateBody(updateCatalogoSchema), updateById);
router.delete("/:id", removeById);

export default router;
