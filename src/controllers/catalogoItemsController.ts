import { type Request, type Response, type NextFunction } from "express";
import { ImageS3Service } from "../s3-image-module";
import { ApiError } from "../utils/ApiError";
import {
  createCatalogoItem,
  createCatalogoItems,
  deleteCatalogoItemByUuid,
  getCatalogoItemByUuid,
  listCatalogoItems,
  updateCatalogoItemByUuid
} from "../services/catalogoItemsService";
import { logger } from "../utils/logger";

function requireUserId(req: Request): string {
  const user = req.user;
  if (!user) {
    throw new ApiError(401, "No autorizado");
  }
  return user.id;
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = requireUserId(req);
    const catalogId = req.params.catalogId;
    if (Array.isArray(req.body)) {
      const items = await createCatalogoItems(userId, catalogId, req.body);
      logger.info("[catalogo-items] create bulk", {
        userId,
        catalogId,
        count: items.length
      });
      res.status(201).json({ items });
      return;
    }

    const item = await createCatalogoItem(userId, catalogId, req.body);
    logger.info("[catalogo-items] create", { userId, catalogId, itemUuid: item.uuid });
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
}

export async function createFromBody(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = requireUserId(req);
    const { catalogoId, ...input } = req.body as { catalogoId: string };
    let payload = { ...input };
    const file = req.file as Express.Multer.File | undefined;
    if (file) {
      const result = await ImageS3Service.uploadImage(file, "catalogo-items");
      payload = { ...payload, image: result.url };
    }
    const item = await createCatalogoItem(userId, catalogoId, payload);
    logger.info("[catalogo-items] create", { userId, catalogoId, itemUuid: item.uuid });
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
}

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = requireUserId(req);
    const catalogId = req.params.catalogId;
    const items = await listCatalogoItems(userId, catalogId);
    res.json({ items });
  } catch (error) {
    next(error);
  }
}

export async function listByCatalog(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = requireUserId(req);
    const catalogId = String(req.query.catalogoId ?? req.body?.catalogoId ?? "").trim();
    if (!catalogId) {
      throw new ApiError(400, "catalogoId requerido");
    }
    const items = await listCatalogoItems(userId, catalogId);
    res.json({ items });
  } catch (error) {
    next(error);
  }
}

export async function getByUuid(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = requireUserId(req);
    const catalogId = req.params.catalogId;
    const item = await getCatalogoItemByUuid(userId, catalogId, req.params.itemUuid);
    logger.info("[catalogo-items] get", { userId, catalogId, itemUuid: item.uuid });
    res.json(item);
  } catch (error) {
    next(error);
  }
}

export async function getByUuidFromBody(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = requireUserId(req);
    const catalogId = req.body.catalogoId as string;
    const item = await getCatalogoItemByUuid(userId, catalogId, req.body.itemUuid as string);
    logger.info("[catalogo-items] get", { userId, catalogId, itemUuid: item.uuid });
    res.json(item);
  } catch (error) {
    next(error);
  }
}

export async function getByUuidFromParams(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = requireUserId(req);
    const catalogId = String(req.query.catalogoId ?? "").trim();
    if (!catalogId) {
      throw new ApiError(400, "catalogoId requerido");
    }
    const item = await getCatalogoItemByUuid(userId, catalogId, req.params.itemUuid);
    logger.info("[catalogo-items] get", { userId, catalogId, itemUuid: item.uuid });
    res.json(item);
  } catch (error) {
    next(error);
  }
}

export async function updateByUuid(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = requireUserId(req);
    const catalogId = req.params.catalogId;
    const item = await updateCatalogoItemByUuid(userId, catalogId, req.params.itemUuid, req.body);
    logger.info("[catalogo-items] update", { userId, catalogId, itemUuid: item.uuid });
    res.json(item);
  } catch (error) {
    next(error);
  }
}

export async function updateByUuidFromBody(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = requireUserId(req);
    const { catalogoId, itemUuid, ...input } = req.body as {
      catalogoId: string;
      itemUuid: string;
    };
    const item = await updateCatalogoItemByUuid(userId, catalogoId, itemUuid, input);
    logger.info("[catalogo-items] update", { userId, catalogoId, itemUuid: item.uuid });
    res.json(item);
  } catch (error) {
    next(error);
  }
}

export async function removeByUuid(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = requireUserId(req);
    const catalogId = req.params.catalogId;
    await deleteCatalogoItemByUuid(userId, catalogId, req.params.itemUuid);
    logger.info("[catalogo-items] delete", { userId, catalogId, itemUuid: req.params.itemUuid });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function removeByUuidFromBody(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = requireUserId(req);
    const catalogId = req.body.catalogoId as string;
    const itemUuid = req.body.itemUuid as string;
    await deleteCatalogoItemByUuid(userId, catalogId, itemUuid);
    logger.info("[catalogo-items] delete", { userId, catalogId, itemUuid });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function updateByUuidFromParams(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = requireUserId(req);
    const catalogId = String(req.body.catalogoId ?? "").trim();
    if (!catalogId) {
      throw new ApiError(400, "catalogoId requerido");
    }
    const item = await updateCatalogoItemByUuid(userId, catalogId, req.params.itemUuid, req.body);
    logger.info("[catalogo-items] update", { userId, catalogId, itemUuid: item.uuid });
    res.json(item);
  } catch (error) {
    next(error);
  }
}

export async function removeByUuidFromParams(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = requireUserId(req);
    const catalogId = String(req.body.catalogoId ?? "").trim();
    if (!catalogId) {
      throw new ApiError(400, "catalogoId requerido");
    }
    await deleteCatalogoItemByUuid(userId, catalogId, req.params.itemUuid);
    logger.info("[catalogo-items] delete", { userId, catalogId, itemUuid: req.params.itemUuid });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

function extractS3Key(url: string): string | null {
  const marker = ".com/";
  const index = url.indexOf(marker);
  if (index === -1) {
    return null;
  }
  return url.slice(index + marker.length);
}

export async function uploadItemImage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = requireUserId(req);
    const catalogId = String(req.body?.catalogoId ?? "").trim();
    const itemUuid = String(req.body?.itemUuid ?? "").trim();

    if (!catalogId || !itemUuid) {
      throw new ApiError(400, "catalogoId e itemUuid requeridos");
    }

    const file = req.file as Express.Multer.File | undefined;
    if (!file) {
      throw new ApiError(400, "Se requiere una imagen");
    }

    const item = await getCatalogoItemByUuid(userId, catalogId, itemUuid);
    const result = await ImageS3Service.uploadImage(file, "catalogo-items");

    if (item.image) {
      const key = extractS3Key(item.image);
      if (key) {
        await ImageS3Service.deleteImage(key);
      }
    }

    await item.update({ image: result.url });
    logger.info("[catalogo-items] image upload", {
      userId,
      catalogId,
      itemUuid,
      imageUrl: result.url
    });
    res.json({ image: result.url, key: result.key });
  } catch (error) {
    next(error);
  }
}
