import { type Request, type Response, type NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { ImageS3Service } from "../s3-image-module";
import Catalogo from "../models/Catalogo";
import CatalogoImage from "../models/CatalogoImage";
import { logger } from "../utils/logger";
import {
  catalogoIdObjectSchema,
  sortOrderObjectSchema,
  sortOrderCoerceSchema
} from "../validations/images.validation";

const DEFAULT_FOLDER = "catalogos";
const MAX_IMAGES = 10;

async function requireCatalogoById(userId: string, catalogoId: string): Promise<Catalogo> {
  const catalogo = await Catalogo.findOne({ where: { id: catalogoId, userId } });
  if (!catalogo) {
    throw new ApiError(404, "Catálogo no encontrado");
  }
  return catalogo;
}

function parseCatalogoId(value: unknown): string {
  const result = catalogoIdObjectSchema.safeParse({ catalogoId: value });
  if (!result.success) {
    throw new ApiError(400, "Datos inválidos", { errors: result.error.errors });
  }
  return result.data.catalogoId;
}

export async function uploadCatalogoImages(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user;
    if (!user) {
      throw new ApiError(401, "No autorizado");
    }

    const catalogoId = parseCatalogoId(req.body?.catalogoId);
    const catalogo = await requireCatalogoById(user.id, catalogoId);

    const files = req.files as Express.Multer.File[] | undefined;
    if (!files || files.length === 0) {
      throw new ApiError(400, "Se requiere al menos 1 imagen");
    }

    if (files.length > MAX_IMAGES) {
      throw new ApiError(400, `Máximo ${MAX_IMAGES} imágenes por request`);
    }

    const uploaded = [] as Array<{ id: string; url: string; key: string }>;

    let sortOrderBase = 0;
    const sortOrderRaw = req.body?.sortOrder;
    if (sortOrderRaw !== undefined && sortOrderRaw !== null && String(sortOrderRaw).trim() !== "") {
      const sortResult = sortOrderCoerceSchema.safeParse(sortOrderRaw);
      if (!sortResult.success) {
        throw new ApiError(400, "Datos inválidos", { errors: sortResult.error.errors });
      }
      sortOrderBase = sortResult.data;
    }

    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];
      const result = await ImageS3Service.uploadImage(file, DEFAULT_FOLDER);
      const image = await CatalogoImage.create({
        catalogId: catalogo.id,
        imageUrl: result.url,
        sortOrder: sortOrderBase + i
      });
      uploaded.push({ id: image.id, url: image.imageUrl, key: result.key });
    }

    logger.info("[imagenes] upload", {
      userId: user.id,
      catalogoId: catalogo.id,
      count: uploaded.length
    });
    res.status(201).json({ count: uploaded.length, images: uploaded });
  } catch (error) {
    next(error);
  }
}

export async function listCatalogoImages(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user;
    if (!user) {
      throw new ApiError(401, "No autorizado");
    }

    const catalogoId = parseCatalogoId(req.query.catalogoId);
    const catalogo = await requireCatalogoById(user.id, catalogoId);
    const images = await CatalogoImage.findAll({
      where: { catalogId: catalogo.id },
      order: [["sortOrder", "ASC"], ["createdAt", "ASC"]]
    });

    logger.info("[imagenes] list", {
      userId: user.id,
      catalogoId: catalogo.id,
      count: images.length
    });
    res.json({ count: images.length, images });
  } catch (error) {
    next(error);
  }
}

async function requireImageForUser(userId: string, imageId: string): Promise<CatalogoImage> {
  const image = await CatalogoImage.findByPk(imageId);
  if (!image) {
    throw new ApiError(404, "Imagen no encontrada");
  }

  await requireCatalogoById(userId, image.catalogId);
  return image;
}

export async function deleteImage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user;
    if (!user) {
      throw new ApiError(401, "No autorizado");
    }

    const imageId = req.params.imageId;
    const image = await requireImageForUser(user.id, imageId);

    const key = image.imageUrl.split(".com/")[1];
    if (key) {
      await ImageS3Service.deleteImage(key);
    }

    await image.destroy();
    logger.info("[imagenes] delete", {
      userId: user.id,
      catalogoId: image.catalogId,
      imageId: image.id
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function updateImage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user;
    if (!user) {
      throw new ApiError(401, "No autorizado");
    }

    const imageId = req.params.imageId;
    const image = await requireImageForUser(user.id, imageId);

    const sortResult = sortOrderObjectSchema.safeParse({ sortOrder: req.body?.sortOrder });
    if (!sortResult.success) {
      throw new ApiError(400, "Datos inválidos", { errors: sortResult.error.errors });
    }

    const sortOrder = sortResult.data.sortOrder;

    await image.update({ sortOrder });
    logger.info("[imagenes] update", {
      userId: user.id,
      catalogoId: image.catalogId,
      imageId: image.id,
      sortOrder
    });
    res.json(image);
  } catch (error) {
    next(error);
  }
}
