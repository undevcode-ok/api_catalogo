import { type Request, type Response, type NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import {
  createCatalogo,
  deleteCatalogoById,
  getCatalogoById,
  listCatalogos,
  updateCatalogoById
} from "../services/catalogosService";
import { generateCatalogoPdf } from "../services/catalogosPdfService";
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
    const catalogo = await createCatalogo(userId, req.body);
    logger.info("[catalogos] create", { userId, catalogoId: catalogo.id });
    res.status(201).json(catalogo);
  } catch (error) {
    next(error);
  }
}

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = requireUserId(req);
    const pageRaw = req.query.page;
    const limitRaw = req.query.limit;

    const page = pageRaw ? Number(pageRaw) : 1;
    const limit = limitRaw ? Number(limitRaw) : 10;

    if (!Number.isFinite(page) || page < 1 || !Number.isFinite(limit) || limit < 1 || limit > 100) {
      throw new ApiError(400, "Paginacion invalida");
    }

    const result = await listCatalogos(userId, page, limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = requireUserId(req);
    const catalogo = await getCatalogoById(userId, req.params.id);
    logger.info("[catalogos] get", { userId, catalogoId: catalogo.id });
    res.json(catalogo);
  } catch (error) {
    next(error);
  }
}

export async function updateById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = requireUserId(req);
    const catalogo = await updateCatalogoById(userId, req.params.id, req.body);
    logger.info("[catalogos] update", { userId, catalogoId: catalogo.id });
    res.json(catalogo);
  } catch (error) {
    next(error);
  }
}

export async function removeById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = requireUserId(req);
    await deleteCatalogoById(userId, req.params.id);
    logger.info("[catalogos] delete", { userId, catalogoId: req.params.id });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function downloadPdf(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = requireUserId(req);
    await generateCatalogoPdf(userId, req.params.id, res);
    logger.info("[catalogos] pdf", { userId, catalogoId: req.params.id });
  } catch (error) {
    next(error);
  }
}
