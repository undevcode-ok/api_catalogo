import { type Request, type Response, type NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { ImageS3Service } from "../s3-image-module";
import Catalogo from "../models/Catalogo";
import CatalogoImage from "../models/CatalogoImage";

const DEFAULT_FOLDER = "catalogos";
const MAX_IMAGES = 10;

async function requireCatalogo(req: Request): Promise<Catalogo> {
  const user = req.user;
  if (!user) {
    throw new ApiError(401, "No autorizado");
  }

  const catalogoId = req.params.id;
  const catalogo = await Catalogo.findOne({ where: { id: catalogoId, userId: user.id } });
  if (!catalogo) {
    throw new ApiError(404, "Catálogo no encontrado");
  }

  return catalogo;
}

export async function uploadCatalogoImages(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const catalogo = await requireCatalogo(req);

    const files = req.files as Express.Multer.File[] | undefined;
    if (!files || files.length === 0) {
      throw new ApiError(400, "Se requiere al menos 1 imagen");
    }

    if (files.length > MAX_IMAGES) {
      throw new ApiError(400, `Máximo ${MAX_IMAGES} imágenes por request`);
    }

    const folderRaw = req.body?.folder;
    const folder = typeof folderRaw === "string" && folderRaw.trim() !== "" ? folderRaw.trim() : DEFAULT_FOLDER;

    const uploaded = [] as Array<{ id: string; url: string; key: string }>

    let sortOrderBase = 0;
    const sortOrderRaw = req.body?.sortOrder;
    if (typeof sortOrderRaw === "string" && sortOrderRaw.trim() !== "" && Number.isFinite(Number(sortOrderRaw))) {
      sortOrderBase = Number(sortOrderRaw);
    }

    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];
      const result = await ImageS3Service.uploadImage(file, folder);
      const image = await CatalogoImage.create({
        catalogId: catalogo.id,
        imageUrl: result.url,
        sortOrder: sortOrderBase + i
      });
      uploaded.push({ id: image.id, url: image.imageUrl, key: result.key });
    }

    res.status(201).json({ count: uploaded.length, images: uploaded });
  } catch (error) {
    next(error);
  }
}

export async function listCatalogoImages(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const catalogo = await requireCatalogo(req);
    const images = await CatalogoImage.findAll({
      where: { catalogId: catalogo.id },
      order: [["sortOrder", "ASC"], ["createdAt", "ASC"]]
    });

    res.json({ count: images.length, images });
  } catch (error) {
    next(error);
  }
}

export async function deleteCatalogoImage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const catalogo = await requireCatalogo(req);
    const imageId = req.params.imageId;

    const image = await CatalogoImage.findOne({ where: { id: imageId, catalogId: catalogo.id } });
    if (!image) {
      throw new ApiError(404, "Imagen no encontrada");
    }

    const key = image.imageUrl.split(".com/")[1];
    if (key) {
      await ImageS3Service.deleteImage(key);
    }

    await image.destroy();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function updateCatalogoImage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const catalogo = await requireCatalogo(req);
    const imageId = req.params.imageId;

    const image = await CatalogoImage.findOne({ where: { id: imageId, catalogId: catalogo.id } });
    if (!image) {
      throw new ApiError(404, "Imagen no encontrada");
    }

    const sortOrderRaw = req.body?.sortOrder;
    if (typeof sortOrderRaw !== "number" && typeof sortOrderRaw !== "string") {
      throw new ApiError(400, "sortOrder requerido");
    }

    const sortOrder = Number(sortOrderRaw);
    if (!Number.isFinite(sortOrder)) {
      throw new ApiError(400, "sortOrder inválido");
    }

    await image.update({ sortOrder });
    res.json(image);
  } catch (error) {
    next(error);
  }
}
