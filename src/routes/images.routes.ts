import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import { uploadMiddleware } from "../s3-image-module";
import { ApiError } from "../utils/ApiError";
import {
  deleteCatalogoImage,
  listCatalogoImages,
  updateCatalogoImage,
  uploadCatalogoImages
} from "../controllers/imagesController";

const router = Router();

const missingCatalogoId = (_req: unknown, _res: unknown, next: (err: ApiError) => void) => {
  next(new ApiError(400, "Id de catalogo requerido"));
};

const missingCatalogoImageId = (_req: unknown, _res: unknown, next: (err: ApiError) => void) => {
  next(new ApiError(400, "id de imagen requerido"));
};

router.post("/catalogos/images", authMiddleware, missingCatalogoId);
router.get("/catalogos/images", authMiddleware, missingCatalogoId);
router.put("/catalogos/images", authMiddleware, missingCatalogoId);
router.delete("/catalogos/images", authMiddleware, missingCatalogoId);

router.get("/catalogos/images/:imageId", authMiddleware, missingCatalogoId);
router.put("/catalogos/images/:imageId", authMiddleware, missingCatalogoId);
router.delete("/catalogos/images/:imageId", authMiddleware, missingCatalogoId);

router.put("/catalogos/:id/images", authMiddleware, missingCatalogoImageId);
router.delete("/catalogos/:id/images", authMiddleware, missingCatalogoImageId);

router.post("/catalogos/:id/images", authMiddleware, uploadMiddleware.array("images", 10), uploadCatalogoImages);
router.get("/catalogos/:id/images", authMiddleware, listCatalogoImages);
router.put("/catalogos/:id/images/:imageId", authMiddleware, updateCatalogoImage);
router.delete("/catalogos/:id/images/:imageId", authMiddleware, deleteCatalogoImage);

export default router;
