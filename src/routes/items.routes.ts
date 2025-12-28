import { Router, type Request, type Response, type NextFunction } from "express";
import { authMiddleware } from "../middlewares/auth";
import { validateBody } from "../middlewares/validate";
import { uploadMiddleware } from "../s3-image-module";
import {
  createFromBody,
  getByUuidFromParams,
  listByCatalog,
  removeByUuidFromParams,
  updateByUuidFromParams,
  uploadItemImage
} from "../controllers/catalogoItemsController";
import {
  createCatalogoItemWithCatalogSchema,
  deleteCatalogoItemWithCatalogOnlySchema,
  updateCatalogoItemWithCatalogOnlySchema
} from "../validations/catalogoItems.validation";

const router = Router();

function maybeUploadItemImage(req: Request, res: Response, next: NextFunction): void {
  if (req.is("multipart/form-data")) {
    uploadMiddleware.single("image")(req, res, next);
    return;
  }
  next();
}

router.post("/items", authMiddleware, maybeUploadItemImage, validateBody(createCatalogoItemWithCatalogSchema), createFromBody);
router.get("/items", authMiddleware, listByCatalog);
router.get("/items/:itemUuid", authMiddleware, getByUuidFromParams);
router.put("/items/:itemUuid", authMiddleware, validateBody(updateCatalogoItemWithCatalogOnlySchema), updateByUuidFromParams);
router.delete("/items/:itemUuid", authMiddleware, validateBody(deleteCatalogoItemWithCatalogOnlySchema), removeByUuidFromParams);
router.post("/items/image", authMiddleware, uploadMiddleware.single("image"), uploadItemImage);

export default router;
