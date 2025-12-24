import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import { uploadMiddleware } from "../s3-image-module";
import { deleteImage, listCatalogoImages, updateImage, uploadCatalogoImages } from "../controllers/imagesController";

const router = Router();

router.post("/images", authMiddleware, uploadMiddleware.array("images", 10), uploadCatalogoImages);
router.get("/images", authMiddleware, listCatalogoImages);
router.put("/images/:imageId", authMiddleware, updateImage);
router.delete("/images/:imageId", authMiddleware, deleteImage);

export default router;
